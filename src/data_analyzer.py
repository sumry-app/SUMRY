"""
Educational Data Analysis Module
Provides functions for analyzing educational datasets
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional


class EducationalDataAnalyzer:
    """Main class for analyzing educational data"""

    def __init__(self, df: pd.DataFrame):
        """
        Initialize the analyzer with a dataset

        Args:
            df: DataFrame containing educational data
        """
        self.df = df.copy()

    def get_basic_statistics(self, numeric_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Calculate basic statistics for numeric columns

        Args:
            numeric_cols: List of column names to analyze. If None, uses all numeric columns.

        Returns:
            DataFrame with statistical summary
        """
        if numeric_cols is None:
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()

        stats = self.df[numeric_cols].describe()
        return stats

    def calculate_grade_distribution(self, grade_column: str) -> Dict[str, int]:
        """
        Calculate distribution of letter grades

        Args:
            grade_column: Name of the column containing grades

        Returns:
            Dictionary with grade counts
        """
        if grade_column not in self.df.columns:
            raise ValueError(f"Column '{grade_column}' not found in dataset")

        grade_counts = self.df[grade_column].value_counts().to_dict()
        return grade_counts

    def calculate_pass_fail_rate(self, score_column: str, passing_score: float = 60) -> Dict[str, float]:
        """
        Calculate pass/fail rates based on a threshold

        Args:
            score_column: Name of the column containing scores
            passing_score: Minimum score to pass

        Returns:
            Dictionary with pass/fail statistics
        """
        if score_column not in self.df.columns:
            raise ValueError(f"Column '{score_column}' not found in dataset")

        total = len(self.df)
        passed = (self.df[score_column] >= passing_score).sum()
        failed = total - passed

        return {
            'total_students': total,
            'passed': passed,
            'failed': failed,
            'pass_rate': (passed / total * 100) if total > 0 else 0,
            'fail_rate': (failed / total * 100) if total > 0 else 0
        }

    def get_top_performers(self, score_column: str, n: int = 10) -> pd.DataFrame:
        """
        Get top n performers based on scores

        Args:
            score_column: Name of the column containing scores
            n: Number of top performers to return

        Returns:
            DataFrame with top performers
        """
        return self.df.nlargest(n, score_column)

    def get_struggling_students(self, score_column: str, threshold: float = 50, n: int = 10) -> pd.DataFrame:
        """
        Identify students who are struggling (below threshold)

        Args:
            score_column: Name of the column containing scores
            threshold: Score below which students are considered struggling
            n: Maximum number of students to return

        Returns:
            DataFrame with struggling students
        """
        struggling = self.df[self.df[score_column] < threshold]
        return struggling.nsmallest(n, score_column)

    def calculate_subject_averages(self, subject_columns: List[str]) -> pd.DataFrame:
        """
        Calculate average scores for each subject

        Args:
            subject_columns: List of column names representing subjects

        Returns:
            DataFrame with subject averages
        """
        averages = {}
        for subject in subject_columns:
            if subject in self.df.columns:
                averages[subject] = {
                    'mean': self.df[subject].mean(),
                    'median': self.df[subject].median(),
                    'std': self.df[subject].std(),
                    'min': self.df[subject].min(),
                    'max': self.df[subject].max()
                }

        return pd.DataFrame(averages).T

    def identify_correlations(self, columns: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Calculate correlation matrix for specified columns

        Args:
            columns: List of column names to analyze. If None, uses all numeric columns.

        Returns:
            Correlation matrix
        """
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns.tolist()

        return self.df[columns].corr()

    def calculate_attendance_impact(self, score_column: str, attendance_column: str) -> Dict[str, float]:
        """
        Analyze the relationship between attendance and performance

        Args:
            score_column: Name of the column containing scores
            attendance_column: Name of the column containing attendance percentage

        Returns:
            Dictionary with correlation statistics
        """
        from scipy.stats import pearsonr

        correlation, p_value = pearsonr(self.df[attendance_column], self.df[score_column])

        return {
            'correlation': correlation,
            'p_value': p_value,
            'interpretation': self._interpret_correlation(correlation)
        }

    @staticmethod
    def _interpret_correlation(corr: float) -> str:
        """Interpret correlation coefficient"""
        abs_corr = abs(corr)
        if abs_corr >= 0.7:
            strength = "strong"
        elif abs_corr >= 0.4:
            strength = "moderate"
        elif abs_corr >= 0.2:
            strength = "weak"
        else:
            strength = "very weak"

        direction = "positive" if corr > 0 else "negative"
        return f"{strength} {direction}"

    def get_grade_trends(self, student_id_col: str, score_cols: List[str]) -> pd.DataFrame:
        """
        Analyze grade trends for individual students across multiple assessments

        Args:
            student_id_col: Column containing student IDs
            score_cols: List of columns containing scores in chronological order

        Returns:
            DataFrame with trend analysis
        """
        trends = []
        for _, student in self.df.iterrows():
            scores = [student[col] for col in score_cols if pd.notna(student[col])]
            if len(scores) >= 2:
                trend = "improving" if scores[-1] > scores[0] else "declining" if scores[-1] < scores[0] else "stable"
                avg_change = (scores[-1] - scores[0]) / len(scores)
            else:
                trend = "insufficient_data"
                avg_change = 0

            trends.append({
                'student_id': student[student_id_col],
                'trend': trend,
                'avg_change': avg_change,
                'first_score': scores[0] if scores else None,
                'last_score': scores[-1] if scores else None
            })

        return pd.DataFrame(trends)


def load_data(file_path: str) -> pd.DataFrame:
    """
    Load educational data from CSV or Excel file

    Args:
        file_path: Path to the data file

    Returns:
        DataFrame containing the data
    """
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith(('.xlsx', '.xls')):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format. Please use CSV or Excel files.")


def assign_letter_grades(score: float) -> str:
    """
    Convert numeric scores to letter grades

    Args:
        score: Numeric score

    Returns:
        Letter grade
    """
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'
