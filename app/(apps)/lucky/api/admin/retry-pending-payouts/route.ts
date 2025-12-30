import { NextRequest, NextResponse } from 'next/server';
import { hybridStorage } from '../../../lib/hybrid-storage';

/**
 * Admin endpoint to retry payouts for pending winners
 * This helps fix cases where payouts failed during round end
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundId, winnerAddress } = body;

    if (!roundId || !winnerAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing roundId or winnerAddress' },
        { status: 400 }
      );
    }

    console.log(`🔄 Admin retry payout for round ${roundId}, winner ${winnerAddress}`);

    // Get lottery data
    const data = await hybridStorage.getData();
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No lottery data found' },
        { status: 404 }
      );
    }

    // Find pending winners (no payout signature or has payout error)
    const pendingWinners = data.winners.filter(
      (w: any) => 
        w.roundId === roundId && 
        w.walletAddress === winnerAddress &&
        (!w.payoutTransactionSignature || w.payoutError)
    );

    if (pendingWinners.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No pending winners found for this round and address' },
        { status: 404 }
      );
    }

    // Use the first pending winner's prize amount
    const prizeAmount = pendingWinners[0].prizeAmount;

    // Get the correct base URL for the payout API
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    console.log(`📡 Calling payout API at: ${baseUrl}/api/payout`);
    
    // Call the payout API
    const payoutResponse = await fetch(`${baseUrl}/api/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winnerAddress: winnerAddress,
        amount: prizeAmount
      })
    });

    const payoutData = await payoutResponse.json();

    if (!payoutResponse.ok || !payoutData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: payoutData.error || 'Payout failed',
          details: payoutData
        },
        { status: payoutResponse.status || 500 }
      );
    }

    // Update all pending winners with the payout signature
    for (const winner of pendingWinners) {
      (winner as any).payoutTransactionSignature = payoutData.signature;
      if ((winner as any).payoutError) {
        delete (winner as any).payoutError;
      }
    }

    // Save updated data
    await hybridStorage.updateData(data);

    console.log(`✅ Updated ${pendingWinners.length} winner record(s) with payout signature: ${payoutData.signature}`);

    return NextResponse.json({
      success: true,
      signature: payoutData.signature,
      amount: prizeAmount,
      winnerAddress: winnerAddress,
      roundId: roundId,
      updatedWinners: pendingWinners.length,
      message: 'Payout sent and winner records updated successfully'
    });

  } catch (error) {
    console.error('❌ Error retrying pending payout:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error retrying payout'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to list all pending payouts
 */
export async function GET(request: NextRequest) {
  try {
    const data = await hybridStorage.getData();
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No lottery data found' },
        { status: 404 }
      );
    }

    // Find all pending winners (no payout signature or has payout error)
    const pendingWinners = data.winners.filter(
      (w: any) => !w.payoutTransactionSignature || w.payoutError
    );

    return NextResponse.json({
      success: true,
      pendingWinners: pendingWinners.map((w: any) => ({
        roundId: w.roundId,
        walletAddress: w.walletAddress,
        prizeAmount: w.prizeAmount,
        timestamp: w.timestamp,
        payoutError: w.payoutError || null
      })),
      count: pendingWinners.length
    });

  } catch (error) {
    console.error('❌ Error listing pending payouts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

