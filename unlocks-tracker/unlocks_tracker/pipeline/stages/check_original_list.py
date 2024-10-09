from files import read_original_list
from pipeline.daos import Context


class CheckOriginalListStage:
    def execute(self, context: Context):
        all_outgoing_transfers = (
            context.processed_golem_out_transfers
            + context.from_partners_out_transfers
        )
        not_present_original_list = set()

        original = read_original_list()

        for address in original:
            if address.strip() not in map(
                lambda word: word["to"].lower(), all_outgoing_transfers
            ):
                print(
                    "[ERROR] Address that is present on "
                    "the original list but we didn't find it in our list",
                    address.strip(),
                )

                raise Exception(
                    f"Address that is present on the "
                    f"original list but we didn't "
                    f"find it in our list {address.strip}"
                )

        context.not_present_original_list = not_present_original_list
        return context
