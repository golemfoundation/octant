import logging

from logging.config import dictConfig

from gql.transport.requests import log as gql_logger


class BelowFilter(logging.Filter):
    def __init__(self, level, name=""):
        super().__init__(name)
        self.level = getattr(logging, level)

    def filter(self, record):
        return record.levelno < self.level


def config(app_level):
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "generic": {
                "format": "%(asctime)s [%(process)d] [%(levelname)s] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "class": "logging.Formatter",
            }
        },
        "filters": {"below_error": {"()": BelowFilter, "level": "ERROR"}},
        "handlers": {
            "stdout": {
                "class": "logging.StreamHandler",
                "formatter": "generic",
                "stream": "ext://sys.stdout",
                "filters": ["below_error"],
            },
            "stderr": {
                "level": "ERROR",
                "class": "logging.StreamHandler",
                "formatter": "generic",
                "stream": "ext://sys.stderr",
            },
        },
        "loggers": {
            "root": {"level": "INFO", "handlers": ["stdout", "stderr"]},
            "app": {
                "level": app_level,
                "handlers": ["stdout", "stderr"],
                "propagate": 0,
            },
            "gunicorn.error": {
                "level": "WARNING",
                "handlers": ["stdout", "stderr"],
                "propagate": 0,
            },
            gql_logger.name: {
                "level": "WARNING",
            },
            "apscheduler.executors.default": {
                "level": "WARNING",
            },
            "uvicorn": {  # Adding for the uvicorn logger (FastAPI)
                "level": app_level,
                "handlers": ["stdout", "stderr"],
                "propagate": 0,
            },
        },
    }


def init_logger(app):
    app_level = app.config["LOG_LVL"]

    dictConfig(config(app_level))

    app.logger.info(f"Enabled logging at {app_level} level")
