// src/types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  ResetPassword: undefined;
};

export type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
export type VerificationCodeScreenProps = NativeStackScreenProps<RootStackParamList, 'VerificationCode'>;
export type NewPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'NewPassword'>;