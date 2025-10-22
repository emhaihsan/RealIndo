# RealIndo 🎓

**Learn Regional Languages with Web3 Rewards**

A blockchain-powered language learning platform that gamifies education and rewards users with NFT vouchers from local merchant partners.

---

## 🎯 Overview

RealIndo combines:

- 📚 **Interactive Learning**: Video lessons + flashcard vocabulary practice
- ⭐ **Gamification**: Earn EXP (experience points) for completing lessons
- 💰 **Token Economy**: Convert EXP → RINDO tokens (1:1 ratio)
- 🎁 **NFT Rewards**: Redeem RINDO for NFT vouchers from local merchants
- ⛓️ **Blockchain**: Base Sepolia testnet for transparent, verifiable transactions

**Current Focus**: Bahasa Banjar (South Kalimantan regional language)

---

## 🚀 Live Demo

**Frontend**: https://rindo.netlify.app

**Smart Contracts** (Base Sepolia):

- RINDOToken: `0x26bBaE72dab5EEa1f5d5178CF2d3d5E6Cf55D1e0`
- VoucherNFT: `0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d`

---

## 📋 Features

### For Users

- ✅ Web3Auth login (Google, social)
- ✅ Watch video lessons → earn EXP
- ✅ Practice flashcards → earn EXP
- ✅ Convert EXP → RINDO tokens (on-chain)
- ✅ Redeem RINDO → NFT vouchers
- ✅ View owned NFTs on blockchain
- ✅ Responsive UI (mobile/tablet/desktop)

### For Merchants

- ✅ Create vouchers with discount details
- ✅ Set RINDO token cost
- ✅ Track redemptions on-chain
- ✅ Verify NFT ownership

---

## 🏗️ Architecture

### Frontend

- **Framework**: Next.js 15 (React)
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: Web3Auth + Wagmi + ethers.js
- **Database**: Supabase (PostgreSQL)

### Backend

- **API Routes**: Next.js API routes
- **Database**: Supabase with RLS policies
- **Authentication**: Web3Auth + wallet-based

### Blockchain

- **Network**: Base Sepolia (Ethereum L2)
- **RINDOToken**: ERC20 token for rewards
- **VoucherNFT**: ERC1155 NFT for vouchers
- **Framework**: Foundry (Solidity development)

---

## 📁 Project Structure

```
realindo/
├── contracts/                    # Smart contracts
│   ├── src/
│   │   ├── RINDOToken.sol       # ERC20 token
│   │   └── VoucherNFT.sol       # ERC1155 NFT
│   ├── test/                    # Foundry tests
│   ├── script/                  # Deployment scripts
│   └── foundry.toml
│
├── realindo-app/                # Next.js frontend
│   ├── src/
│   │   ├── app/                 # Pages & API routes
│   │   │   ├── page.tsx         # Landing page (login)
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── convert/         # EXP → RINDO
│   │   │   ├── marketplace/     # Redeem vouchers
│   │   │   ├── my-nfts/         # View owned NFTs
│   │   │   ├── lesson/          # Video & flashcard
│   │   │   └── api/             # Backend routes
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities & hooks
│   │   └── styles/              # Global CSS
│   ├── public/                  # Static assets
│   ├── .env.local               # Environment variables
│   └── package.json
│
├── docs/                        # Documentation
├── netlify.toml                 # Netlify config
└── README.md
```

---

## 🔧 Tech Stack

| Layer               | Technology                              |
| ------------------- | --------------------------------------- |
| **Frontend**        | Next.js 15, React 19, TypeScript        |
| **Styling**         | TailwindCSS, shadcn/ui                  |
| **Web3**            | Web3Auth, Wagmi, ethers.js              |
| **Database**        | Supabase (PostgreSQL)                   |
| **Backend**         | Next.js API Routes                      |
| **Blockchain**      | Base Sepolia, Solidity                  |
| **Smart Contracts** | Foundry, OpenZeppelin                   |
| **Deployment**      | Netlify (frontend), Foundry (contracts) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone repository**

```bash
git clone https://github.com/emhaihsan/RealIndo.git
cd RealIndo
```

2. **Setup frontend**

```bash
cd realindo-app
npm install
cp .env.example .env.local
# Fill in environment variables
npm run dev
```

3. **Setup contracts** (optional)

```bash
cd contracts
forge install
forge build
forge test
```

### Environment Variables

Create `.env.local` in `realindo-app/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web3Auth
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id

# Base Sepolia
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/your_key
NEXT_PUBLIC_CHAIN_ID=84532

# Smart Contracts
NEXT_PUBLIC_RINDO_TOKEN_ADDRESS=0x26bBaE72dab5EEa1f5d5178CF2d3d5E6Cf55D1e0
NEXT_PUBLIC_VOUCHER_NFT_ADDRESS=0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d

# Admin (for token minting)
ADMIN_WALLET_PRIVATE_KEY=your_private_key
```

---

## 📖 User Flow

```
1. LOGIN
   └─ Web3Auth (Google) → Create wallet → Sync to database

2. LEARN
   ├─ Watch video lesson → +10 EXP
   └─ Practice flashcards → +15 EXP

3. CONVERT
   └─ EXP → RINDO tokens (1:1 ratio, on-chain)

4. REDEEM
   ├─ Browse marketplace
   ├─ Select voucher
   ├─ Approve RINDO spend
   └─ Mint NFT voucher

5. COLLECT
   └─ View owned NFTs on blockchain
```

---

## 🧪 Testing

### Frontend

```bash
cd realindo-app
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # TypeScript check
```

### Smart Contracts

```bash
cd contracts
forge test                                    # Run all tests
forge test --match-contract RINDOTokenTest   # Specific test
forge coverage                                # Code coverage
```

---

## 📊 Smart Contracts

### RINDOToken (ERC20)

- **Function**: `mintFromEXP(address to, uint256 amount)`
- **Owner**: Admin wallet (backend)
- **Supply**: Minted on-demand (no cap)

### VoucherNFT (ERC1155)

- **Function**: `redeemVoucher(uint256 tokenId, uint256 amount)`
- **Mechanism**: User approves RINDO → contract burns RINDO → mints NFT
- **Metadata**: IPFS URIs for voucher details

---

## 🔐 Security

- ✅ Smart contracts verified on BaseScan
- ✅ RLS policies on Supabase (row-level security)
- ✅ Service role key only for backend
- ✅ Private key never exposed in frontend
- ✅ Web3Auth for secure wallet management

---

## 📈 Roadmap

- [ ] Multi-language support (Javanese, Sundanese, etc.)
- [ ] Leaderboards & achievements
- [ ] Social features (referrals, challenges)
- [ ] Mobile app (React Native)
- [ ] Mainnet deployment
- [ ] DAO governance
- [ ] Advanced space repetition algorithm

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Team

**Muhammad Ihsan** - Full Stack Developer

- GitHub: [@emhaihsan](https://github.com/emhaihsan)
- Email: emhaihsan@gmail.com

---

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- Web3Auth for wallet authentication
- Supabase for backend infrastructure
- Netlify for deployment
- Base for Ethereum L2 network

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3Auth Docs](https://web3auth.io/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Base Network](https://docs.base.org/)

---

**Made with ❤️ for learning and community**
