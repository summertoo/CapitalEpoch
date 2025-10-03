import { NextRequest, NextResponse } from 'next/server';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// 初始化Aptos客户端
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

// 合约地址
const CONTRACT_ADDRESS = "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d";

// GET - 获取所有代币
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    // 调用合约的view函数获取所有代币
    const tokens = await aptos.view({
      function: `${CONTRACT_ADDRESS}::token_factory::get_all_tokens`,
      arguments: []
    });

    // 获取每个代币的详细信息
    const tokenDetails = await Promise.all(
      (tokens[0] as string[]).map(async (tokenAddress: string) => {
        try {
          const tokenInfo = await aptos.view({
            function: `${CONTRACT_ADDRESS}::token_factory::get_token_info`,
            arguments: [tokenAddress]
          });

          return {
            address: tokenAddress,
            name: tokenInfo[0],
            symbol: tokenInfo[1],
            decimals: tokenInfo[2],
            totalSupply: tokenInfo[3],
            creator: tokenInfo[4],
            createdAt: tokenInfo[5]
          };
        } catch (error) {
          console.error(`获取代币信息失败 ${tokenAddress}:`, error);
          return null;
        }
      })
    );

    // 过滤掉获取失败的代币
    const validTokens = tokenDetails.filter(token => token !== null);

    // 如果指定了创建者，则过滤结果
    const filteredTokens = creator 
      ? validTokens.filter(token => token.creator === creator)
      : validTokens;

    return NextResponse.json({
      success: true,
      data: filteredTokens,
      total: filteredTokens.length
    });

  } catch (error) {
    console.error('获取代币列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取代币列表失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// POST - 创建新代币（这里主要用于记录，实际创建在前端完成）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash, creator, name, symbol, decimals, initialSupply } = body;

    // 验证交易是否成功
    if (txHash) {
      try {
        const transaction = await aptos.getTransactionByHash({ transactionHash: txHash });
        
        if (transaction.success) {
          // 这里可以将代币信息存储到数据库
          // 暂时返回成功响应
          return NextResponse.json({
            success: true,
            message: '代币创建记录成功',
            data: {
              txHash,
              creator,
              name,
              symbol,
              decimals,
              initialSupply,
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
    console.error('处理代币创建请求失败:', error);
    return NextResponse.json({
      success: false,
      error: '处理请求失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}