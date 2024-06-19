export type Response = {
  score: number;
};

export async function apiGetUqScore(_address: string, _epoch: number): Promise<Response> {
  return new Promise(resolve => {
    resolve({ score: 1 });
  });
}
