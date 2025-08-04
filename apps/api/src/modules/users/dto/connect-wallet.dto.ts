import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConnectWalletDto {
  @ApiProperty({
    description: 'Solana wallet address',
    example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Wallet signature for verification',
    example: 'signature_hash_here',
  })
  @IsString()
  signature: string;
}