from config import Config
from files import save_processing_stage
from infrastructure.etherscan_api import retrieve_outgoing_transfers
from pipeline.daos import Context, SenderDetails
from pipeline.filters import filter_outgoing_transfers
from schemas import TransfersSchema


class RetrievePartnerTransfersStage:
    def _retrieve_organizations_txs_start_block(
        self, transfers: TransfersSchema
    ):
        organizations_txs_blocks = {}
        organization_addresses = set(
            map(lambda word: word.lower(), Config.ORGANIZATIONS_ADDRESS)
        )

        for transfer in transfers:
            recipient = transfer["to"].lower()

            if recipient not in organization_addresses:
                continue

            block_number = int(transfer["blockNumber"])
            if (
                recipient not in organizations_txs_blocks
                or block_number < organizations_txs_blocks[recipient]
            ):
                organizations_txs_blocks[recipient] = block_number

        return organizations_txs_blocks

    def execute(self, context: Context):
        from_golem_out_transfers = context.processed_golem_out_transfers
        organizations_txs_blocks = (
            self._retrieve_organizations_txs_start_block(
                from_golem_out_transfers
            )
        )

        if len(organizations_txs_blocks.keys()) != len(
            Config.ORGANIZATIONS_ADDRESS
        ):
            raise Exception("Not all organizations have been found")

        from_partners_out_transfers = []
        for address, start_block in organizations_txs_blocks.items():
            sender_details = SenderDetails(address, start_block)
            organization_out_transfers = retrieve_outgoing_transfers(
                sender_details
            )
            processed_organization_out_transfers = filter_outgoing_transfers(
                organization_out_transfers
            )
            from_partners_out_transfers.extend(
                processed_organization_out_transfers
            )

        context.from_partners_out_transfers = from_partners_out_transfers

        save_processing_stage(
            f"{Config.RESOURCES_OUTPUT_PATH}/"
            f"from_partners_outgoing_transfers.json",
            from_partners_out_transfers,
        )

        return context
