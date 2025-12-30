import { NextRequest, NextResponse } from 'next/server';
import { hybridStorage } from '../../lib/hybrid-storage';

/**
 * Retry payout for a specific winner
 * This allows manually triggering payouts for winners who didn't receive their prize
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winnerAddress, roundId, amount } = body;

    if (!winnerAddress || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid winner address or amount' },
        { status: 400 }
      );
    }

    console.log(`🔄 Retrying payout: ${amount} USDC to ${winnerAddress}`);

    // Call the payout API
    // Get the correct base URL for the payout API
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    console.log(`📡 Calling payout API at: ${baseUrl}/api/payout`);
    
    const payoutResponse = await fetch(`${baseUrl}/api/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winnerAddress: winnerAddress,
        amount: amount
      })
    });

    if (!payoutResponse.ok) {
      const errorData = await payoutResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Payout failed',
          details: errorData
        },
        { status: payoutResponse.status }
      );
    }

    const payoutData = await payoutResponse.json();
    
    if (!payoutData.success) {
      return NextResponse.json(
        { success: false, error: payoutData.error || 'Payout transaction failed' },
        { status: 500 }
      );
    }

    // Update the winner record with the new payout signature
    if (roundId && payoutData.signature) {
      try {
        const data = await hybridStorage.getData();
        if (data) {
          // Find all winners matching this address and round (in case of duplicates)
          const winners = data.winners.filter(
            (w: any) => w.walletAddress === winnerAddress && w.roundId === roundId
          );
          
          for (const winner of winners) {
            (winner as any).payoutTransactionSignature = payoutData.signature;
            if ((winner as any).payoutError) {
              delete (winner as any).payoutError; // Clear any previous error
            }
          }
          
          if (winners.length > 0) {
            await hybridStorage.updateData(data);
            console.log(`✅ Updated ${winners.length} winner record(s) with payout signature`);
          } else {
            console.warn(`⚠️ No winner found with address ${winnerAddress} and roundId ${roundId}`);
          }
        }
      } catch (updateError) {
        console.error('⚠️ Failed to update winner record:', updateError);
        // Don't fail the request if update fails - payout was successful
      }
    }

    return NextResponse.json({
      success: true,
      signature: payoutData.signature,
      amount: amount,
      winnerAddress: winnerAddress,
      message: 'Payout sent successfully'
    });

  } catch (error) {
    console.error('❌ Error retrying payout:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error retrying payout'
      },
      { status: 500 }
    );
  }
}

