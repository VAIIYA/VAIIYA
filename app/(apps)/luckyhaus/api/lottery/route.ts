import { NextRequest, NextResponse } from 'next/server';
import { hybridStorage } from '../../lib/hybrid-storage';
import { calculatePotContribution, calculateCommission } from '../../lib/lottery-config';

// Lottery API - handles MongoDB storage operations
export async function GET(request: NextRequest) {
  console.log('🔍 Lottery API GET request received');
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    console.log('🔍 GET action:', action);

    switch (action) {
      case 'test':
        console.log('🔍 Test endpoint called');
        return NextResponse.json({ success: true, message: 'API is working!' });
        
      case 'current-round':
        console.log('🔍 Getting current round data...');
        let currentRound = await hybridStorage.getCurrentRound();
        
        // If still no data, create a timezone-based daily round
        if (!currentRound) {
          console.log('📝 Creating new round (no existing data found)');
          // Get current time in Amsterdam timezone
          const now = new Date();
          const amsterdamTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
          
          // Calculate next midnight in Amsterdam timezone
          const nextMidnight = new Date(amsterdamTime);
          nextMidnight.setHours(24, 0, 0, 0); // Next midnight in Amsterdam
          
          // Convert back to UTC for consistent storage
          const utcNextMidnight = new Date(nextMidnight.toLocaleString("en-US", {timeZone: "UTC"}));
          
          // Generate round ID based on date (YYYY-MM-DD format in Amsterdam time)
          const roundDate = amsterdamTime.toISOString().split('T')[0];
          const roundId = `round-${roundDate}`;
          
          // Calculate round number based on days since epoch
          const epoch = new Date('2024-01-01');
          const daysSinceEpoch = Math.floor((amsterdamTime.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
          const roundNumber = daysSinceEpoch + 1;
          
          const defaultRound = {
            id: roundId,
            roundNumber: roundNumber,
            potSize: 0,
            totalTickets: 0,
            endTime: utcNextMidnight.getTime(),
            status: 'active' as const
          };
          console.log('📊 Returning default round:', defaultRound);
          return NextResponse.json({ success: true, round: defaultRound });
        }
        
        console.log('✅ Found round data:', currentRound);
        return NextResponse.json({ success: true, round: currentRound });

      case 'recent-winners':
        const limit = parseInt(searchParams.get('limit') || '10');
        console.log('🔍 Getting recent winners, limit:', limit);
        
        let data = await hybridStorage.getData();
        
        if (!data) {
          console.log('❌ No lottery data found');
          return NextResponse.json({ success: true, winners: [] });
        }
        
        console.log('🔍 Winners data structure:', {
          totalWinners: data.winners.length,
          winners: data.winners,
          currentRound: data.currentRound
        });
        
        const winners = data.winners.slice(0, limit);
        console.log(`🏆 Found ${winners.length} recent winners:`, winners);
        
        return NextResponse.json({ success: true, winners: winners });

      case 'user-tickets':
        const walletAddress = searchParams.get('wallet');
        const roundId = searchParams.get('roundId');
        if (!walletAddress || !roundId) {
          return NextResponse.json({ success: false, error: 'Missing wallet or roundId' }, { status: 400 });
        }
        const tickets = await hybridStorage.getUserTickets(walletAddress, roundId);
        return NextResponse.json({ success: true, tickets: tickets || [] });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in lottery API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 Lottery API POST request received');
  try {
    const body = await request.json();
    const { action } = body;
    console.log('🔍 POST action:', action);

    switch (action) {
      case 'buy-ticket':
        const { roundId, walletAddress, ticketNumber, amount, quantity = 1 } = body;
        
        if (!roundId || !walletAddress || !ticketNumber || !amount) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`🎫 Adding ${quantity} ticket${quantity > 1 ? 's' : ''} to storage...`);
        
        // Calculate commission and pot contribution
        const totalAmount = parseFloat(amount);
        const commission = calculateCommission(totalAmount);
        const potContribution = calculatePotContribution(totalAmount);
        
        console.log(`💰 Commission calculation: ${totalAmount} USDC - ${commission.toFixed(4)} USDC commission = ${potContribution.toFixed(4)} USDC to pot`);
        
        // Add multiple tickets in a loop
        // Use a small delay between tickets to ensure unique timestamps and avoid race conditions
        let allTicketsSuccess = true;
        const baseTimestamp = Date.now();
        for (let i = 0; i < quantity; i++) {
          // Ensure unique ticket IDs with timestamp + random + index
          const ticketId = `ticket-${baseTimestamp}-${i}-${Math.random().toString(36).substr(2, 9)}`;
          const ticketPotContribution = potContribution / quantity; // Split the pot contribution among tickets
          
          let ticketSuccess = await hybridStorage.addTicket({
            id: ticketId,
            walletAddress,
            roundId,
            timestamp: baseTimestamp + i, // Slightly different timestamp for each ticket
            transactionSignature: body.transactionSignature
          }, ticketPotContribution);

          if (!ticketSuccess) {
            console.error(`❌ Failed to save ticket ${i + 1} to storage`);
            allTicketsSuccess = false;
            break;
          } else {
            console.log(`✅ Ticket ${i + 1} saved successfully (ID: ${ticketId})`);
          }
          
          // Small delay to ensure database operations complete
          if (i < quantity - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        if (!allTicketsSuccess) {
          console.error('❌ Failed to save some tickets to storage');
          return NextResponse.json({ success: false, error: 'Failed to save some tickets to storage' }, { status: 500 });
        } else {
          console.log(`✅ All ${quantity} tickets saved successfully`);
        }

        // Note: Round stats are already updated by addTicket() method
        // This section is kept for potential future consistency checks

        return NextResponse.json({ success: true, message: 'Ticket purchased successfully' });


      case 'end-round':
        const { roundId: endRoundId } = body;
        
        console.log('🎯 End round request for:', endRoundId);
        
        if (!endRoundId) {
          return NextResponse.json({ success: false, error: 'Missing roundId' }, { status: 400 });
        }

        // End round and select winner logic
        console.log('🔍 Getting lottery data from storage...');
        let data = await hybridStorage.getData();
        
        if (!data) {
          console.error('❌ No lottery data found');
          return NextResponse.json({ success: false, error: 'No lottery data found' }, { status: 404 });
        }
        
        console.log('✅ Found lottery data:', {
          currentRound: data.currentRound,
          ticketsCount: data.tickets.length,
          winnersCount: data.winners.length
        });
        
        // Check if this round has already been ended (prevent duplicates)
        const existingWinner = data.winners.find((w: any) => w.roundId === endRoundId);
        if (existingWinner) {
          console.log('⚠️ Round already ended. Winner:', existingWinner.walletAddress);
          return NextResponse.json({ 
            success: true, 
            message: 'Round already ended',
            winner: {
              walletAddress: existingWinner.walletAddress,
              prizeAmount: existingWinner.prizeAmount,
              payoutTransactionSignature: existingWinner.payoutTransactionSignature
            },
            alreadyEnded: true
          });
        }
        
        const roundTickets = data.tickets.filter(ticket => ticket.roundId === endRoundId);
        console.log(`🎫 Found ${roundTickets.length} tickets for round ${endRoundId}`);
        
        let winner = null;
        
        // Only select winner if there are tickets
        if (roundTickets.length > 0) {
          const randomIndex = Math.floor(Math.random() * roundTickets.length);
          winner = roundTickets[randomIndex];
          console.log('🏆 Winner selected:', winner.walletAddress);
          
          // Only record winner if there's an actual prize amount
          const prizeAmount = data.currentRound.potSize;
          if (prizeAmount <= 0) {
            console.log('⚠️ No prize amount to award, skipping winner recording');
          } else {
            console.log(`💰 Prize amount: ${prizeAmount} USDC`);
            
            // Create payout transaction via API endpoint
            let payoutSignature: string | undefined = undefined;
            let payoutError: string | undefined = undefined;
            try {
              console.log('💸 Attempting to send payout transaction...');
              
              // Get the correct base URL for the payout API
              // In Vercel, we can use the request URL to determine the base
              const requestUrl = new URL(request.url);
              const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
              
              console.log(`📡 Calling payout API at: ${baseUrl}/api/payout`);
              
              const payoutResponse = await fetch(`${baseUrl}/api/payout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  winnerAddress: winner.walletAddress,
                  amount: prizeAmount
                })
              });
              
              const payoutData = await payoutResponse.json();
              
              if (payoutResponse.ok && payoutData.success && payoutData.signature) {
                payoutSignature = payoutData.signature;
                console.log('✅ Payout transaction sent successfully:', payoutSignature);
              } else {
                payoutError = payoutData.error || `HTTP ${payoutResponse.status}: ${payoutResponse.statusText}`;
                console.error('❌ Payout transaction failed:', payoutError);
              }
            } catch (payoutError) {
              const errorMsg = payoutError instanceof Error ? payoutError.message : 'Unknown error';
              payoutError = errorMsg;
              console.error('❌ Error sending payout transaction:', errorMsg);
              // Continue to record winner even if payout fails (can be retried later)
            }
            
            // Record winner with payout transaction
            console.log('💾 Saving winner to storage...');
            let winnerData = await hybridStorage.getData();
            
            if (winnerData) {
              const newWinner = {
                roundId: endRoundId,
                walletAddress: winner.walletAddress,
                prizeAmount: prizeAmount,
                timestamp: Date.now(),
                payoutTransactionSignature: payoutSignature || undefined,
                payoutError: payoutError || undefined // Store error for debugging
              };
              
              winnerData.winners.push(newWinner);
              console.log('🏆 Added winner:', newWinner);
              
              let saveSuccess = await hybridStorage.updateData(winnerData);
              
              if (saveSuccess) {
                console.log('✅ Winner saved successfully');
                if (payoutError) {
                  console.warn('⚠️ Winner saved but payout failed. Use /api/retry-payout to send the payout.');
                }
              } else {
                console.error('❌ Failed to save winner to storage');
              }
            } else {
              console.error('❌ No lottery data available to save winner');
            }
          }
        } else {
          console.log('⚠️ No tickets found for this round');
        }

        // Create new round for next day
        const now = new Date();
        const amsterdamTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
        
        // Calculate next midnight in Amsterdam timezone
        const nextMidnight = new Date(amsterdamTime);
        nextMidnight.setHours(24, 0, 0, 0); // Next midnight in Amsterdam
        
        // Convert back to UTC for consistent storage
        const utcNextMidnight = new Date(nextMidnight.toLocaleString("en-US", {timeZone: "UTC"}));
        
        // Generate new round ID based on date (YYYY-MM-DD format in Amsterdam time)
        const roundDate = amsterdamTime.toISOString().split('T')[0];
        const newRoundId = `round-${roundDate}`;
        
        // Calculate round number based on days since epoch
        const epoch = new Date('2024-01-01');
        const daysSinceEpoch = Math.floor((amsterdamTime.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
        const newRoundNumber = daysSinceEpoch + 1;
        
        // Create new round
        const newRound = {
          id: newRoundId,
          roundNumber: newRoundNumber,
          potSize: 0,
          totalTickets: 0,
          endTime: utcNextMidnight.getTime(),
          status: 'active' as const
        };

        // Update the current round
        await hybridStorage.updateRound(newRound);

        console.log('🎯 Returning end round response:', {
          success: true,
          winner: winner ? {
            walletAddress: winner.walletAddress,
            ticketId: winner.id,
            prizeAmount: data.currentRound.potSize
          } : null,
          newRound: newRound
        });

        return NextResponse.json({ 
          success: true, 
          winner: winner ? {
            walletAddress: winner.walletAddress,
            ticketId: winner.id,
            prizeAmount: data.currentRound.potSize
          } : null,
          newRound: newRound
        });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in lottery API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
