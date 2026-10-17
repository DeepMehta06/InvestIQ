from backend.optimization.stub import stub_frontier, stub_metrics, stub_optimize


def test_stub_weights_sum_to_one():
    tickers = ["AAPL", "MSFT", "NVDA", "JPM"]
    weights = stub_optimize(tickers)
    assert abs(sum(weights.values()) - 1.0) < 1e-5


def test_stub_weights_keys_match_tickers():
    tickers = ["AAPL", "MSFT"]
    weights = stub_optimize(tickers)
    assert set(weights.keys()) == set(tickers)


def test_stub_metrics_has_required_keys():
    metrics = stub_metrics()
    required = {
        "expected_return",
        "volatility",
        "sharpe_ratio",
        "sortino_ratio",
        "max_drawdown",
        "var_95",
        "cvar_95",
        "var_95_parametric",
    }
    assert required.issubset(set(metrics.keys()))


def test_stub_frontier_is_list():
    assert isinstance(stub_frontier(["AAPL", "MSFT"]), list)
