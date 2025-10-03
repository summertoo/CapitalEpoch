# CapitalEpoch

A GameFi DeFi platform on Aptos blockchain where players can create digital commercial streets and build various facilities to compete in monthly performance rankings.

## Overview

In CapitalEpoch, one player issues tokens, creates trading pairs, then builds a digital commercial street. Other players construct facilities there—stores, bars, schools, convenience shops, clothing stores, etc.—to jointly boost its prosperity. Monthly performance contests reward top players generously; the lowest-ranked close down or switch businesses.

## Features

- **Token Creation**: Players can issue their own tokens
- **Trading Pairs**: Create trading pairs with USDT
- **Commercial Streets**: Build digital commercial streets associated with trading pairs
- **Facilities**: Construct various facilities including:
  - Shops
  - Bars
  - Schools
  - Convenience Stores
  - Clothing Stores
- **Performance Ranking**: Monthly competition with rewards and penalties
- **GameFi Elements**: Combines DeFi with gaming mechanics

## Technology Stack

- **Blockchain**: Aptos
- **Smart Contracts**: Move language
- **Frontend**: React + TypeScript + Vite
- **Backend**: Next.js API
- **Wallet Integration**: Petra Wallet

## Getting Started

1. Connect your Petra wallet
2. Create your token
3. Create a trading pair
4. Build your commercial street
5. Invite others to build facilities
6. Compete in monthly performance rankings

## Smart Contracts

- `token_factory.move`: Token creation and management
- `trading_pair.move`: Trading pair functionality with AMM
- `commercial_street.move`: Commercial street management
- `facility.move`: Facility creation and management
- `performance.move`: Performance tracking and rewards
- `usdt_mock.move`: Test USDT token

## Frontend Components

- Token Creator
- Trading Pair Creator
- Commercial Street Manager
- Facility Builder
- Performance Ranking Dashboard
- Portfolio Tracker
- Trading Interface

## Requirements

- Node.js 18+
- Aptos CLI
- Petra Wallet (for testing)

## License

MIT