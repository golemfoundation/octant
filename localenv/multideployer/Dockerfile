FROM octant/contracts:latest as hardhat
FROM octant/subgraph:latest as graph

RUN apk add curl python3 bash


RUN mkdir /hardhat/
WORKDIR /hardhat/
COPY --from=hardhat /app/ /hardhat/
RUN npx hardhat compile

WORKDIR /app/

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh
COPY wait_for_subgraph.sh .
RUN chmod +x ./wait_for_subgraph.sh
COPY server.py /app/server.py

ENTRYPOINT ["./entrypoint.sh"]
