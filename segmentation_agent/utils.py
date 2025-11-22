import pandas as pd
from datetime import datetime

def load_raw_data(path: str) -> pd.DataFrame:
    """Load the Online Retail dataset from Excel."""
    df = pd.read_excel(path)
    return df

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["CustomerID"])
    df = df[df["Quantity"] > 0]
    df = df[df["UnitPrice"] > 0]
    return df

def build_rfm_table(df: pd.DataFrame, reference_date: datetime = None) -> pd.DataFrame:
    df = df.copy()
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

    if reference_date is None:
        reference_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

    def monetary_sum(group):
        return (group * df.loc[group.index, "UnitPrice"]).sum()

    rfm = df.groupby("CustomerID").agg({
        "InvoiceDate": lambda x: (reference_date - x.max()).days,
        "InvoiceNo": "nunique",
        "Quantity": monetary_sum
    })

    rfm.rename(columns={
        "InvoiceDate": "Recency",
        "InvoiceNo": "Frequency",
        "Quantity": "Monetary"
    }, inplace=True)

    return rfm.reset_index()
