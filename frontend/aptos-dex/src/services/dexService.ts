import { Aptos, AptosConfig, Network, Account } from '@aptos-labs/ts-sdk';

// DEX服务类
export class DEXService {
  private aptos: Aptos;
  private moduleAddress: string;

  constructor() {
    const config = new AptosConfig({ network: Network.DEVNET });
    this.aptos = new Aptos(config);
    this.moduleAddress = '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d'; // 替换为实际部署地址
  }

  // USDT换代币
  async swapUsdtForToken(
    account: Account,
    tokenType: string,
    usdtAmount: number,
    minTokenOut: number
  ) {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${this.moduleAddress}::dex_trading::swap_usdt_for_token`,
          typeArguments: [tokenType],
          functionArguments: [
            Math.floor(usdtAmount * 1000000), // 转换为最小单位
            Math.floor(minTokenOut * 1000000)
          ]
        }
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: account,
        transaction
      });

      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash
      });

      return {
        success: true,
        hash: committedTxn.hash,
        transaction: executedTransaction
      };
    } catch (error) {
      console.error('USDT换代币失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '交易失败'
      };
    }
  }

  // 代币换USDT
  async swapTokenForUsdt(
    account: Account,
    tokenType: string,
    tokenAmount: number,
    minUsdtOut: number
  ) {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${this.moduleAddress}::dex_trading::swap_token_for_usdt`,
          typeArguments: [tokenType],
          functionArguments: [
            Math.floor(tokenAmount * 1000000),
            Math.floor(minUsdtOut * 1000000)
          ]
        }
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: account,
        transaction
      });

      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash
      });

      return {
        success: true,
        hash: committedTxn.hash,
        transaction: executedTransaction
      };
    } catch (error) {
      console.error('代币换USDT失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '交易失败'
      };
    }
  }

  // 获取交易对信息
  async getPairInfo(pairId: string) {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.moduleAddress}::dex_trading::get_pair_info`,
          functionArguments: [pairId]
        }
      });

      const [tokenAReserve, tokenBReserve, feeRate, minTradeAmount, creator, totalVolume, feeCollected] = result;

      return {
        success: true,
        data: {
          tokenAReserve: Number(tokenAReserve) / 1000000,
          tokenBReserve: Number(tokenBReserve) / 1000000,
          feeRate: Number(feeRate),
          minTradeAmount: Number(minTradeAmount) / 1000000,
          creator: creator as string,
          totalVolume: Number(totalVolume) / 1000000,
          feeCollected: Number(feeCollected) / 1000000
        }
      };
    } catch (error) {
      console.error('获取交易对信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取失败'
      };
    }
  }

  // 获取交换预览
  async getSwapPreview(pairId: string, inputAmount: number, isUsdtToToken: boolean) {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${this.moduleAddress}::dex_trading::get_swap_preview`,
          functionArguments: [
            pairId,
            Math.floor(inputAmount * 1000000),
            isUsdtToToken
          ]
        }
      });

      const [outputAmount, feeAmount] = result;

      return {
        success: true,
        data: {
          outputAmount: Number(outputAmount) / 1000000,
          feeAmount: Number(feeAmount) / 1000000
        }
      };
    } catch (error) {
      console.error('获取交换预览失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取预览失败'
      };
    }
  }

  // 创建交易对
  async createTradingPair(
    account: Account,
    tokenAType: string,
    tokenBType: string,
    initialA: number,
    initialB: number,
    feeRate: number,
    minTradeAmount: number
  ) {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${this.moduleAddress}::dex_trading::create_pair`,
          typeArguments: [tokenAType, tokenBType],
          functionArguments: [
            Math.floor(initialA * 1000000),
            Math.floor(initialB * 1000000),
            feeRate,
            Math.floor(minTradeAmount * 1000000)
          ]
        }
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: account,
        transaction
      });

      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash
      });

      return {
        success: true,
        hash: committedTxn.hash,
        transaction: executedTransaction
      };
    } catch (error) {
      console.error('创建交易对失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建失败'
      };
    }
  }

  // 添加流动性
  async addLiquidity(
    account: Account,
    tokenAType: string,
    tokenBType: string,
    tokenAAmount: number,
    tokenBAmount: number
  ) {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${this.moduleAddress}::dex_trading::add_liquidity`,
          typeArguments: [tokenAType, tokenBType],
          functionArguments: [
            Math.floor(tokenAAmount * 1000000),
            Math.floor(tokenBAmount * 1000000)
          ]
        }
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: account,
        transaction
      });

      const executedTransaction = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash
      });

      return {
        success: true,
        hash: committedTxn.hash,
        transaction: executedTransaction
      };
    } catch (error) {
      console.error('添加流动性失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加流动性失败'
      };
    }
  }

  // 获取账户余额
  async getAccountBalance(accountAddress: string, coinType: string) {
    try {
      const resource = await this.aptos.getAccountResource({
        accountAddress,
        resourceType: `0x1::coin::CoinStore<${coinType}>`
      });

      const balance = (resource.data as any).coin.value;
      return {
        success: true,
        balance: Number(balance) / 1000000
      };
    } catch (error) {
      console.error('获取余额失败:', error);
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : '获取余额失败'
      };
    }
  }

  // 获取交易事件
  async getTradeEvents(accountAddress?: string, _limit: number = 50) {
    try {
      // 这里应该查询链上事件，简化处理返回模拟数据
      const events = [
        {
          sequence_number: '1',
          type: `${this.moduleAddress}::dex_trading::TradeEvent`,
          data: {
            user: accountAddress || '0x123',
            pair_id: 'USDT-TOKEN1',
            token_in: 'USDT',
            token_out: 'TOKEN1',
            amount_in: '100000000',
            amount_out: '200000000',
            fee_amount: '6000000',
            timestamp: Date.now().toString()
          }
        }
      ];

      return {
        success: true,
        events: events.map(event => ({
          ...event.data,
          amount_in: Number(event.data.amount_in) / 1000000,
          amount_out: Number(event.data.amount_out) / 1000000,
          fee_amount: Number(event.data.fee_amount) / 1000000,
          timestamp: Number(event.data.timestamp)
        }))
      };
    } catch (error) {
      console.error('获取交易事件失败:', error);
      return {
        success: false,
        events: [],
        error: error instanceof Error ? error.message : '获取事件失败'
      };
    }
  }
}

// 导出单例实例
export const dexService = new DEXService();