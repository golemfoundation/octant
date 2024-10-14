from pipeline.daos import Context


class Pipeline:
    def __init__(self, stages):
        self.stages = stages

    def run(self, context: Context):
        for stage in self.stages:
            context = stage.execute(context)
        return context
