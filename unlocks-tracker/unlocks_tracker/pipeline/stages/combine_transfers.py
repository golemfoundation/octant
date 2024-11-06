from pipeline.daos import Context
from pipeline.filters import remove_redundancy


class CombineTransfersStage:
    def execute(self, context: Context):
        from_golem_out_transfers = context.processed_golem_out_transfers
        from_partners_out_transfers = context.from_partners_out_transfers

        all_outgoing_transfers = (
            from_partners_out_transfers + from_golem_out_transfers
        )
        all_outgoing_transfers_no_companies = remove_redundancy(
            all_outgoing_transfers
        )

        context.all_outgoing_transfers_no_companies = (
            all_outgoing_transfers_no_companies
        )

        return context
