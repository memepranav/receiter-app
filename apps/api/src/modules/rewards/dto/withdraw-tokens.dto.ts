import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class WithdrawTokensDto {
  @ApiProperty({
    description: 'Amount of tokens to withdraw',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Withdrawal amount must be at least 1 token' })
  amount: number;

  @ApiProperty({
    description: 'Wallet address to withdraw to (optional, uses connected wallet if not provided)',
    example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    required: false,
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;
}