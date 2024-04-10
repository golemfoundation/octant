FROM octant/contracts:latest as hardhat
FROM octant/subgraph:latest as graph

RUN apk add curl python3 bash


RUN mkdir /hardhat/
WORKDIR /hardhat/
COPY --from=hardhat /app/ /hardhat/
RUN npx hardhat compile

WORKDIR /app/

COPY --chmod=+x entrypoint.sh .
COPY --chmod=+x wait_for_subgraph.sh .
COPY server.py /app/server.py

ENTRYPOINT ["./entrypoint.sh"]
