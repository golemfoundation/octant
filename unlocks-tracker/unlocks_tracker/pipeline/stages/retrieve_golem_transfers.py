from config import Config
from files import save_processing_stage
from infrastructure.etherscan_api import retrieve_outgoing_transfers
from pipeline.daos import Context, SenderDetails
from pipeline.filters import filter_outgoing_transfers


class RetrieveGolemTransfersStage:
    def execute(self, context: Context):
        senders_details = [
            SenderDetails(address, Config.GOLEM_FIRST_OUT_TRANSFER_BLOCK)
            for address in Config.GOLEM_ADDRESSES
        ]
        out_transfers = retrieve_outgoing_transfers(*senders_details)
        processed_golem_out_transfers = filter_outgoing_transfers(
            out_transfers
        )

        context.processed_golem_out_transfers = processed_golem_out_transfers

        save_processing_stage(
            "resources/output/from_golem_outgoing_transfers.json",
            processed_golem_out_transfers,
        )

        return context
