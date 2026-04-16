import axios from "axios";
import { Repository } from "typeorm";
import { env } from "../../config/env";
import { AppDataSource } from "../../config/database";
import { QuoteCacheEntity } from "./entities/quote-cache.entity";

type AlphaVantageResponse = {
  "Time Series (Daily)"?: Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  >;
};

export type TransformedQuote = {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  dailyChangePercent: string;
};

export class MarketService {
  private quoteCacheRepository: Repository<QuoteCacheEntity>;

  constructor() {
    this.quoteCacheRepository = AppDataSource.getRepository(QuoteCacheEntity);
  }

  async getExternalData(days = 5): Promise<TransformedQuote[]> {
    const response = await axios.get<AlphaVantageResponse>("https://www.alphavantage.co/query", {
      params: {
        function: "TIME_SERIES_DAILY",
        symbol: env.ALPHA_VANTAGE_SYMBOL,
        outputsize: env.ALPHA_VANTAGE_OUTPUT_SIZE,
        apikey: env.ALPHA_VANTAGE_API_KEY,
      },
    });

    const timeSeries = response.data["Time Series (Daily)"];
    if (!timeSeries) {
      throw new Error("Alpha Vantage response does not include time series data");
    }

    const transformed = Object.entries(timeSeries)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .slice(0, days)
      .map(([date, quote]) => {
        const open = Number.parseFloat(quote["1. open"]);
        const close = Number.parseFloat(quote["4. close"]);
        const high = Number.parseFloat(quote["2. high"]);
        const low = Number.parseFloat(quote["3. low"]);
        const volume = Number.parseInt(quote["5. volume"], 10);
        const change = ((close - open) / open) * 100;
        const dailyChangePercent = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

        return { date, open, close, high, low, volume, dailyChangePercent };
      });

    await this.quoteCacheRepository.save(
      transformed.map((quote) => this.quoteCacheRepository.create({ symbol: env.ALPHA_VANTAGE_SYMBOL, ...quote }))
    );

    return transformed;
  }

  async getHistory(limit = 20): Promise<TransformedQuote[]> {
    const cached = await this.quoteCacheRepository.find({
      where: { symbol: env.ALPHA_VANTAGE_SYMBOL },
      order: { cachedAt: "DESC" },
      take: limit,
    });

    return cached.map((entry) => ({
      date: entry.date,
      open: entry.open,
      close: entry.close,
      high: entry.high,
      low: entry.low,
      volume: entry.volume,
      dailyChangePercent: entry.dailyChangePercent,
    }));
  }
}
