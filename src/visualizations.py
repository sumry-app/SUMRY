"""
Visualization Module for Educational Data
Provides functions for creating charts and graphs
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from typing import List, Optional


# Set default style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)


def plot_score_distribution(df: pd.DataFrame, score_column: str, title: str = "Score Distribution"):
    """
    Create a histogram showing score distribution

    Args:
        df: DataFrame containing the data
        score_column: Name of the column containing scores
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = px.histogram(
        df,
        x=score_column,
        nbins=20,
        title=title,
        labels={score_column: 'Score', 'count': 'Number of Students'},
        color_discrete_sequence=['#1f77b4']
    )

    fig.update_layout(
        xaxis_title="Score",
        yaxis_title="Number of Students",
        showlegend=False
    )

    return fig


def plot_grade_distribution(grade_counts: dict, title: str = "Grade Distribution"):
    """
    Create a bar chart showing grade distribution

    Args:
        grade_counts: Dictionary with grade counts
        title: Plot title

    Returns:
        Plotly figure object
    """
    grades = list(grade_counts.keys())
    counts = list(grade_counts.values())

    fig = go.Figure(data=[
        go.Bar(x=grades, y=counts, marker_color='lightblue')
    ])

    fig.update_layout(
        title=title,
        xaxis_title="Grade",
        yaxis_title="Number of Students",
        showlegend=False
    )

    return fig


def plot_subject_comparison(subject_averages: pd.DataFrame, title: str = "Subject Performance Comparison"):
    """
    Create a bar chart comparing average scores across subjects

    Args:
        subject_averages: DataFrame with subject statistics
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = go.Figure(data=[
        go.Bar(
            x=subject_averages.index,
            y=subject_averages['mean'],
            error_y=dict(type='data', array=subject_averages['std']),
            marker_color='steelblue'
        )
    ])

    fig.update_layout(
        title=title,
        xaxis_title="Subject",
        yaxis_title="Average Score",
        showlegend=False
    )

    return fig


def plot_correlation_heatmap(correlation_matrix: pd.DataFrame, title: str = "Correlation Matrix"):
    """
    Create a heatmap showing correlations between variables

    Args:
        correlation_matrix: Correlation matrix DataFrame
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = px.imshow(
        correlation_matrix,
        text_auto='.2f',
        aspect="auto",
        color_continuous_scale='RdBu_r',
        title=title,
        zmin=-1,
        zmax=1
    )

    return fig


def plot_scatter_with_trend(df: pd.DataFrame, x_column: str, y_column: str,
                           title: str = "Scatter Plot with Trend Line"):
    """
    Create a scatter plot with trend line

    Args:
        df: DataFrame containing the data
        x_column: Column name for x-axis
        y_column: Column name for y-axis
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = px.scatter(
        df,
        x=x_column,
        y=y_column,
        trendline="ols",
        title=title
    )

    fig.update_layout(
        xaxis_title=x_column,
        yaxis_title=y_column
    )

    return fig


def plot_box_plot(df: pd.DataFrame, columns: List[str], title: str = "Score Distribution by Subject"):
    """
    Create box plots for multiple columns

    Args:
        df: DataFrame containing the data
        columns: List of column names to plot
        title: Plot title

    Returns:
        Plotly figure object
    """
    df_melted = df[columns].melt(var_name='Subject', value_name='Score')

    fig = px.box(
        df_melted,
        x='Subject',
        y='Score',
        title=title,
        color='Subject'
    )

    return fig


def plot_student_trend(scores: List[float], labels: List[str], student_name: str = "Student"):
    """
    Create a line chart showing student performance trend

    Args:
        scores: List of scores
        labels: List of assessment labels
        student_name: Name of the student

    Returns:
        Plotly figure object
    """
    fig = go.Figure(data=go.Scatter(
        x=labels,
        y=scores,
        mode='lines+markers',
        marker=dict(size=10),
        line=dict(width=2)
    ))

    fig.update_layout(
        title=f"Performance Trend: {student_name}",
        xaxis_title="Assessment",
        yaxis_title="Score",
        showlegend=False
    )

    return fig


def plot_pass_fail_pie(pass_fail_stats: dict, title: str = "Pass/Fail Distribution"):
    """
    Create a pie chart showing pass/fail distribution

    Args:
        pass_fail_stats: Dictionary with pass/fail statistics
        title: Plot title

    Returns:
        Plotly figure object
    """
    labels = ['Passed', 'Failed']
    values = [pass_fail_stats['passed'], pass_fail_stats['failed']]

    fig = go.Figure(data=[go.Pie(
        labels=labels,
        values=values,
        hole=0.3,
        marker_colors=['#2ecc71', '#e74c3c']
    )])

    fig.update_layout(title=title)

    return fig


def plot_attendance_vs_performance(df: pd.DataFrame, attendance_col: str, score_col: str,
                                   title: str = "Attendance vs Performance"):
    """
    Create a scatter plot showing relationship between attendance and performance

    Args:
        df: DataFrame containing the data
        attendance_col: Column name for attendance data
        score_col: Column name for score data
        title: Plot title

    Returns:
        Plotly figure object
    """
    fig = px.scatter(
        df,
        x=attendance_col,
        y=score_col,
        trendline="ols",
        title=title,
        labels={attendance_col: 'Attendance (%)', score_col: 'Score'}
    )

    return fig


def plot_performance_categories(df: pd.DataFrame, score_column: str,
                                title: str = "Performance Categories"):
    """
    Create a bar chart showing students in different performance categories

    Args:
        df: DataFrame containing the data
        score_column: Column name for scores
        title: Plot title

    Returns:
        Plotly figure object
    """
    def categorize(score):
        if score >= 90:
            return 'Excellent (90-100)'
        elif score >= 80:
            return 'Good (80-89)'
        elif score >= 70:
            return 'Average (70-79)'
        elif score >= 60:
            return 'Below Average (60-69)'
        else:
            return 'Failing (<60)'

    df['Category'] = df[score_column].apply(categorize)
    category_counts = df['Category'].value_counts()

    # Define order
    category_order = ['Excellent (90-100)', 'Good (80-89)', 'Average (70-79)',
                     'Below Average (60-69)', 'Failing (<60)']
    category_counts = category_counts.reindex(category_order, fill_value=0)

    colors = ['#2ecc71', '#3498db', '#f39c12', '#e67e22', '#e74c3c']

    fig = go.Figure(data=[
        go.Bar(x=category_counts.index, y=category_counts.values,
               marker_color=colors)
    ])

    fig.update_layout(
        title=title,
        xaxis_title="Performance Category",
        yaxis_title="Number of Students",
        showlegend=False
    )

    return fig
