# routing.py
# The Semantic Router Decision Logic

from enum import Enum

class Route(Enum):
    FACTUAL = "factual"
    COMPLEX = "complex"

def route_query(query: str) -> Route:
    """
    Classifies query intent.
    If 'compare', 'analyze', 'relationship' -> COMPLEX
    Else -> FACTUAL
    """
    complex_triggers = ["compare", "difference", "relationship", "trend", "summary"]
    if any(trigger in query.lower() for trigger in complex_triggers):
        return Route.COMPLEX
    return Route.FACTUAL
