import logging
import sys


def get_logger(name: str) -> logging.Logger:
    """Create and return a configured logger.

    Args:
        name: Logger name — pass __name__ from the calling module.

    Returns:
        Configured Logger writing to stdout.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
        )
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
