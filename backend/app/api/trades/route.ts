import { NextRequest, NextResponse } from 'next/server';

// 模拟交易数据
const mockTrades = [
  {
    id: '1',
    user: '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d',
    timestamp: Date.now() - 3600000,
    pairId: 'USDT-TOKEN1',
    tokenIn: 'USDT',
    tokenOut: 'TOKEN1',
    amountIn: '100.00',
    amountOut: '200.00',
    feeAmount: '6.00',
    txHash: '0xabc123456789',
    status: 'success'
  },
  {
    id: '2',
    user: '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d',
    timestamp: Date.now() - 7200000,
    pairId: 'USDT-TOKEN2',
    tokenIn: 'TOKEN2',
    tokenOut: 'USDT',
    amountIn: '50.00',
    amountOut: '25.00',
    feeAmount: '0.75',
    txHash: '0xdef456789abc',
    status: 'success'
  }
];

// GET - 获取交易历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');
    const pairId = searchParams.get('pair');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredTrades = mockTrades;

    // 按用户地址过滤
    if (userAddress) {
      filteredTrades = filteredTrades.filter(trade => 
        trade.user.toLowerCase() === userAddress.toLowerCase()
      );
    }

    // 按交易对过滤
    if (pairId) {
      filteredTrades = filteredTrades.filter(trade => trade.pairId === pairId);
    }

    // 分页
    const paginatedTrades = filteredTrades
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        trades: paginatedTrades,
        total: filteredTrades.length,
        hasMore: offset + limit < filteredTrades.length
      }
    });

  } catch (error) {
    console.error('获取交易历史失败:', error);
    return NextResponse.json(
      { success: false, error: '获取交易历史失败' },
      { status: 500 }
    );
  }
}

// POST - 记录新交易
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user,
      pairId,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      feeAmount,
      txHash
    } = body;

    // 验证必需字段
    if (!user || !pairId || !tokenIn || !tokenOut || !amountIn || !amountOut || !txHash) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 创建新交易记录
    const newTrade = {
      id: Date.now().toString(),
      user,
      timestamp: Date.now(),
      pairId,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      feeAmount: feeAmount || '0',
      txHash,
      status: 'pending' as const
    };

    // 在实际应用中，这里应该保存到数据库
    mockTrades.unshift(newTrade);

    return NextResponse.json({
      success: true,
      data: newTrade
    });

  } catch (error) {
    console.error('记录交易失败:', error);
    return NextResponse.json(
      { success: false, error: '记录交易失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新交易状态
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tradeId, status, txHash } = body;

    if (!tradeId || !status) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      );
    }

    // 查找并更新交易
    const tradeIndex = mockTrades.findIndex(trade => trade.id === tradeId);
    if (tradeIndex === -1) {
      return NextResponse.json(
        { success: false, error: '交易不存在' },
        { status: 404 }
      );
    }

    mockTrades[tradeIndex].status = status;
    if (txHash) {
      mockTrades[tradeIndex].txHash = txHash;
    }

    return NextResponse.json({
      success: true,
      data: mockTrades[tradeIndex]
    });

  } catch (error) {
    console.error('更新交易状态失败:', error);
    return NextResponse.json(
      { success: false, error: '更新交易状态失败' },
      { status: 500 }
    );
  }
}