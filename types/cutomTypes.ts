export interface loginBody {
  phone_no: number;
  password: string;
}

export interface SignupBody extends loginBody {
  user_name: string;
}
