import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// 初始化Aptos客户端
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

// 合约地址
const CONTRACT_ADDRESS = "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d";

// GET - 获取分析数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return await getOverviewAnalytics();
      case 'volume':
        return await getVolumeAnalytics();
      case 'liquidity':
        return await getLiquidityAnalytics();
      case 'fees':
        return await getFeesAnalytics();
      default:
        return NextResponse.json({
          success: false,
          error: '不支持的分析类型'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取分析数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 获取概览数据
async function getOverviewAnalytics() {
  try {
    // 获取所有代币
    const tokens = await aptos.view({
      function: `${CONTRACT_ADDRESS}::token_factory::get_all_tokens`,
      arguments: []
    });

    // 获取所有交易对
    const pairs = await aptos.view({
      function: `${CONTRACT_ADDRESS}::trading_pair::get_all_pairs`,
      arguments: []
    });

    // 计算总流动性
    let totalLiquidity = 0;
    let activePairs = 0;

    for (const pairAddress of (pairs[0] as string[])) {
      try {
        const pairInfo = await aptos.view({
          function: `${CONTRACT_ADDRESS}::trading_pair::get_pair_info`,
          arguments: [pairAddress]
        });

        const poolInfo = await aptos.view({
          function: `${CONTRACT_ADDRESS}::trading_pair::get_pool_info`,
          arguments: [pairAddress]
        });

        if (pairInfo[7]) { // isActive
          activePairs++;
          totalLiquidity += parseInt(poolInfo[1] as string); // reserveB (USDT)
        }
      } catch (error) {
        console.error(`获取交易对 ${pairAddress} 信息失败:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTokens: (tokens[0] as string[]).length,
        totalPairs: (pairs[0] as string[]).length,
        activePairs,
        totalLiquidity: totalLiquidity / 1000000, // 转换为USDT单位
        last24hVolume: 0, // 需要从事件或数据库获取
        last24hFees: 0,   // 需要从事件或数据库获取
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    throw error;
  }
}

// 获取交易量数据
async function getVolumeAnalytics() {
  // 这里需要从链上事件或数据库获取交易量数据
  // 暂时返回模拟数据
  const mockVolumeData = [
    { date: '2024-01-01', volume: 10000 },
    { date: '2024-01-02', volume: 15000 },
    { date: '2024-01-03', volume: 12000 },
    { date: '2024-01-04', volume: 18000 },
    { date: '2024-01-05', volume: 22000 },
  ];

  return NextResponse.json({
    success: true,
    data: {
      volumeHistory: mockVolumeData,
      totalVolume: mockVolumeData.reduce((sum, item) => sum + item.volume, 0),
      last24hVolume: mockVolumeData[mockVolumeData.length - 1]?.volume || 0
    }
  });
}

// 获取流动性数据
async function getLiquidityAnalytics() {
  try {
    const pairs = await aptos.view({
      function: `${CONTRACT_ADDRESS}::trading_pair::get_all_pairs`,
      arguments: []
    });

    const liquidityByPair = [];
    let totalLiquidity = 0;

    for (const pairAddress of (pairs[0] as string[])) {
      try {
        const pairInfo = await aptos.view({
          function: `${CONTRACT_ADDRESS}::trading_pair::get_pair_info`,
          arguments: [pairAddress]
        });

        const poolInfo = await aptos.view({
          function: `${CONTRACT_ADDRESS}::trading_pair::get_pool_info`,
          arguments: [pairAddress]
        });

        const liquidity = parseInt(poolInfo[1] as string) / 1000000; // USDT
        totalLiquidity += liquidity;

        liquidityByPair.push({
          pairAddress,
          tokenA: pairInfo[0],
          tokenB: pairInfo[1],
          liquidity,
          reserveA: poolInfo[0],
          reserveB: poolInfo[1]
        });
      } catch (error) {
        console.error(`获取交易对 ${pairAddress} 流动性失败:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalLiquidity,
        liquidityByPair: liquidityByPair.sort((a, b) => b.liquidity - a.liquidity),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    throw error;
  }
}

// 获取手续费数据
async function getFeesAnalytics() {
  // 这里需要从链上事件获取手续费数据
  // 暂时返回模拟数据
  const mockFeesData = {
    totalFeesCollected: 1250.50,
    last24hFees: 85.25,
    feesByPair: [
      { pairAddress: '0x123...', fees: 450.25 },
      { pairAddress: '0x456...', fees: 320.15 },
      { pairAddress: '0x789...', fees: 480.10 }
    ]
  };

  return NextResponse.json({
    success: true,
    data: mockFeesData
  });
}