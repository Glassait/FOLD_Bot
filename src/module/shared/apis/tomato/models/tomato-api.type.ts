//region BASE
type BaseTomato = { meta: { id: string } };

export type TomatoError = BaseTomato & { meta: { status: 'error'; message: string } };

type TomatoData<GData> = {
    data: GData;
};

export type TomatoSuccess<GData> = BaseTomato & { meta: { status: 'good'; cached: boolean } } & TomatoData<GData>;
//endregion

export type TomatoOverall = {
    battles: number;
    overallWN8: number;
    avgTier: number;
};
