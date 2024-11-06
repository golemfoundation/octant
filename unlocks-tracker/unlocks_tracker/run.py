from pipeline.daos import Context
from pipeline.pipeline import Pipeline
from pipeline.stages import (
    AccumulateAndCheckLocksStage,
    AccumulateAndCheckOrganizationsStage,
    CheckOriginalListStage,
    CombineTransfersStage,
    RetrieveGolemTransfersStage,
    RetrievePartnerTransfersStage,
    SaveAnalysisOutput,
)


def main():
    pipeline = Pipeline(
        [
            RetrieveGolemTransfersStage(),
            RetrievePartnerTransfersStage(),
            CombineTransfersStage(),
            CheckOriginalListStage(),
            AccumulateAndCheckLocksStage(),
            AccumulateAndCheckOrganizationsStage(),
            SaveAnalysisOutput(),
        ]
    )
    context = Context()

    pipeline.run(context)


if __name__ == "__main__":
    main()
