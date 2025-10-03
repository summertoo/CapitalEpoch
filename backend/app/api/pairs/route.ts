import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// 初始化Aptos客户端
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

// 合约地址
const CONTRACT_ADDRESS = "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d";

// GET - 获取所有交易对
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    // 调用合约的view函数获取所有交易对
    const pairs = await aptos.view({
      function: `${CONTRACT_ADDRESS}::trading_pair::get_all_pairs`,
      arguments: []
    });

    // 获取每个交易对的详细信息
    const pairDetails = await Promise.all(
      (pairs[0] as string[]).map(async (pairAddress: string) => {
        try {
          // 获取交易对基本信息
          const pairInfo = await aptos.view({
            function: `${CONTRACT_ADDRESS}::trading_pair::get_pair_info`,
            arguments: [pairAddress]
          });

          // 获取流动性池信息
          const poolInfo = await aptos.view({
            function: `${CONTRACT_ADDRESS}::trading_pair::get_pool_info`,
            arguments: [pairAddress]
          });

          return {
            address: pairAddress,
            tokenA: pairInfo[0],
            tokenB: pairInfo[1],
            feeRate: pairInfo[2],
            minTradeAmount: pairInfo[3],
            creator: pairInfo[4],
            usdtDeposit: pairInfo[5],
            createdAt: pairInfo[6],
            isActive: pairInfo[7],
            reserveA: poolInfo[0],
            reserveB: poolInfo[1],
            totalLiquidity: poolInfo[2],
            creatorLiquidity: poolInfo[3]
          };
        } catch (error) {
          console.error(`获取交易对信息失败 ${pairAddress}:`, error);
          return null;
        }
      })
    );

    // 过滤掉获取失败的交易对
    const validPairs = pairDetails.filter(pair => pair !== null);

    // 如果指定了创建者，则过滤结果
    const filteredPairs = creator 
      ? validPairs.filter(pair => pair.creator === creator)
      : validPairs;

    return NextResponse.json({
      success: true,
      data: filteredPairs,
      total: filteredPairs.length
    });

  } catch (error) {
    console.error('获取交易对列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取交易对列表失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// POST - 创建新交易对（记录交易）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      txHash, 
      creator, 
      tokenA, 
      tokenB, 
      feeRate, 
      minTradeAmount, 
      usdtDeposit 
    } = body;

    // 验证交易是否成功
    if (txHash) {
      try {
        const transaction = await aptos.getTransactionByHash({ transactionHash: txHash });
        
        if (transaction.success) {
          // 这里可以将交易对信息存储到数据库
          return NextResponse.json({
            success: true,
            message: '交易对创建记录成功',
            data: {
              txHash,
              creator,
              tokenA,
              tokenB,
              feeRate,
              minTradeAmount,
              usdtDeposit,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            error: '交易执行失败'
          }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: '验证交易失败',
          message: error instanceof Error ? error.message : '未知错误'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: false,
      error: '缺少交易哈希'
    }, { status: 400 });

  } catch (error) {
    console.error('处理交易对创建请求失败:', error);
    return NextResponse.json({
      success: false,
      error: '处理请求失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}