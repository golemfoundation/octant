from files import save_output
from pipeline.daos import Context


class SaveAnalysisOutput:
    def execute(self, context: Context):
        print(
            "Addresses to remove:", context.addresses_to_remove_from_allowlist
        )
        print(
            "Organizations to remove:",
            context.organization_addresses_to_remove,
        )

        all_addresses_to_remove = (
            context.addresses_to_remove_from_allowlist
            + context.organization_addresses_to_remove
        )
        save_output(all_addresses_to_remove)
