"""
Data Processing Utilities for Customer Segmentation

This module provides utility functions for loading, cleaning, and transforming
customer transaction data for RFM (Recency, Frequency, Monetary) analysis.

Functions:
    load_raw_data: Load transaction data from Excel file
    clean_data: Clean and validate transaction data
    build_rfm_table: Build RFM features from transaction data
"""

import pandas as pd
from datetime import datetime
from typing import Optional

def load_raw_data(path: str) -> pd.DataFrame:
    """
    Load the Online Retail dataset from an Excel file.
    
    Args:
        path: File path to the Excel file containing transaction data
        
    Returns:
        DataFrame with raw transaction data
        
    Raises:
        FileNotFoundError: If the Excel file is not found
        ValueError: If the file format is invalid
    """
    df = pd.read_excel(path)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and validate transaction data.
    
    Removes:
    - Rows with missing CustomerID (anonymous transactions)
    - Rows with non-positive Quantity (returns, cancellations)
    - Rows with non-positive UnitPrice (invalid pricing)
    
    Args:
        df: Raw transaction DataFrame
        
    Returns:
        Cleaned DataFrame with invalid rows removed
    """
    # Remove transactions without customer ID
    df = df.dropna(subset=["CustomerID"])
    
    # Remove invalid quantities (returns/cancellations)
    df = df[df["Quantity"] > 0]
    
    # Remove invalid prices
    df = df[df["UnitPrice"] > 0]
    
    return df


def build_rfm_table(
    df: pd.DataFrame, 
    reference_date: Optional[datetime] = None
) -> pd.DataFrame:
    """
    Build RFM (Recency, Frequency, Monetary) analysis table.
    
    RFM metrics are key indicators for customer segmentation:
    - Recency: Days since last purchase (lower is better)
    - Frequency: Number of transactions (higher is better)
    - Monetary: Total spending (higher is better)
    
    Args:
        df: Cleaned transaction DataFrame with columns:
            - CustomerID: Unique customer identifier
            - InvoiceDate: Transaction date
            - InvoiceNo: Transaction identifier
            - Quantity: Number of items purchased
            - UnitPrice: Price per item
        reference_date: Reference date for recency calculation.
                       Defaults to max date + 1 day if not provided
        
    Returns:
        DataFrame with RFM features indexed by CustomerID
        Columns: CustomerID, Recency, Frequency, Monetary
        
    Example:
        >>> df = pd.read_csv('transactions.csv')
        >>> df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
        >>> rfm = build_rfm_table(df)
        >>> print(rfm.head())
    """
    df = df.copy()
    
    # Convert InvoiceDate to datetime format
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])

    # Set reference date to day after last transaction if not provided
    if reference_date is None:
        reference_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

    def monetary_sum(group):
        """Calculate total monetary value for a group of transactions."""
        return (group * df.loc[group.index, "UnitPrice"]).sum()

    # Aggregate transactions by customer
    rfm = df.groupby("CustomerID").agg({
        "InvoiceDate": lambda x: (reference_date - x.max()).days,  # Recency
        "InvoiceNo": "nunique",  # Frequency
        "Quantity": monetary_sum  # Monetary
    })

    # Rename columns to RFM naming convention
    rfm.rename(columns={
        "InvoiceDate": "Recency",
        "InvoiceNo": "Frequency",
        "Quantity": "Monetary"
    }, inplace=True)

    return rfm.reset_index()
