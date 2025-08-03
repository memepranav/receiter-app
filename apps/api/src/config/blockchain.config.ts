import { ConfigService } from '@nestjs/config';

export const getBlockchainConfig = (configService: ConfigService) => ({
  solana: {
    rpcUrl: configService.get('SOLANA_RPC_URL'),
    network: configService.get('SOLANA_NETWORK'),
    privateKey: configService.get('SOLANA_PRIVATE_KEY'),
    publicKey: configService.get('SOLANA_PUBLIC_KEY'),
  },
});