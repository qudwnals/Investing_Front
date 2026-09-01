const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type TossEnvelope<T> = {
  data: {
    result: T;
  };
};

export type TossAccount = {
  accountNo?: string;
  accountSeq: number;
  accountType?: string;
};

export type TossHolding = {
  symbol: string;
  name: string;
  currency: string;
  quantity: string;
  lastPrice: string;
  marketValue?: {
    amount?: string;
  };
  profitLoss?: {
    amount?: string;
    rate?: string;
  };
};

export type TossHoldingsOverview = {
  marketValue?: {
    amount?: {
      krw?: string;
      usd?: string;
    };
  };
  profitLoss?: {
    amount?: {
      krw?: string;
      usd?: string;
    };
    rate?: string;
  };
  items: TossHolding[];
};

export type TossBuyingPower = {
  currency: string;
  cashBuyingPower: string;
};

export type PortfolioSnapshot = {
  accounts: TossAccount[];
  holdings: TossHoldingsOverview;
  buyingPower: TossBuyingPower;
};

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const [accounts, holdings, buyingPower] = await Promise.all([
    get<TossAccount[]>('/api/v1/toss/accounts'),
    get<TossHoldingsOverview>('/api/v1/toss/holdings'),
    get<TossBuyingPower>('/api/v1/toss/buying-power?currency=KRW'),
  ]);

  return { accounts, holdings, buyingPower };
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
  if (!response.ok) throw new Error(`TOSS_REQUEST_FAILED_${response.status}`);
  const body = await response.json() as TossEnvelope<T>;
  return body.data.result;
}
