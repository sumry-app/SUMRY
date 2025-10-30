"""
Educational Data Analysis App
A Streamlit-based application for analyzing educational data
"""

import streamlit as st
import pandas as pd
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from data_analyzer import EducationalDataAnalyzer, load_data, assign_letter_grades
from visualizations import (
    plot_score_distribution, plot_grade_distribution, plot_subject_comparison,
    plot_correlation_heatmap, plot_scatter_with_trend, plot_box_plot,
    plot_pass_fail_pie, plot_attendance_vs_performance, plot_performance_categories
)

# Page configuration
st.set_page_config(
    page_title="Educational Data Analysis",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    </style>
""", unsafe_allow_html=True)


def main():
    """Main application function"""

    # Header
    st.markdown('<p class="main-header">📊 Educational Data Analysis App</p>', unsafe_allow_html=True)
    st.markdown("Analyze student performance, identify trends, and gain insights from educational data.")

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Configuration")

        # File upload
        data_source = st.radio(
            "Data Source",
            ["Upload File", "Use Sample Data"],
            help="Choose to upload your own data or use sample data"
        )

        df = None

        if data_source == "Upload File":
            uploaded_file = st.file_uploader(
                "Upload CSV or Excel file",
                type=['csv', 'xlsx', 'xls'],
                help="Upload a file containing educational data"
            )

            if uploaded_file is not None:
                try:
                    if uploaded_file.name.endswith('.csv'):
                        df = pd.read_csv(uploaded_file)
                    else:
                        df = pd.read_excel(uploaded_file)
                    st.success("✅ File uploaded successfully!")
                except Exception as e:
                    st.error(f"Error loading file: {str(e)}")
        else:
            # Load sample data
            sample_file = st.selectbox(
                "Select Sample Dataset",
                ["Student Grades", "Class Performance", "Multi-Subject Analysis"]
            )

            sample_files = {
                "Student Grades": "data/sample_student_grades.csv",
                "Class Performance": "data/sample_class_performance.csv",
                "Multi-Subject Analysis": "data/sample_multi_subject.csv"
            }

            try:
                df = pd.read_csv(sample_files[sample_file])
                st.success(f"✅ Loaded: {sample_file}")
            except Exception as e:
                st.warning(f"⚠️ Sample data not found. Please upload your own data.")

    # Main content
    if df is not None:
        # Data preview
        st.markdown('<p class="sub-header">📋 Data Preview</p>', unsafe_allow_html=True)

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Records", len(df))
        with col2:
            st.metric("Total Columns", len(df.columns))
        with col3:
            st.metric("Numeric Columns", len(df.select_dtypes(include=['number']).columns))

        with st.expander("View Raw Data"):
            st.dataframe(df, use_container_width=True)

        # Initialize analyzer
        analyzer = EducationalDataAnalyzer(df)

        # Analysis tabs
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "📊 Overview", "📈 Performance Analysis", "📉 Visualizations",
            "🔍 Correlations", "👥 Student Insights"
        ])

        with tab1:
            st.markdown('<p class="sub-header">Statistical Overview</p>', unsafe_allow_html=True)

            # Basic statistics
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

            if numeric_cols:
                st.dataframe(analyzer.get_basic_statistics(), use_container_width=True)

                # Column selection for detailed analysis
                selected_col = st.selectbox(
                    "Select column for detailed analysis",
                    numeric_cols,
                    key="overview_col"
                )

                if selected_col:
                    col1, col2 = st.columns(2)

                    with col1:
                        st.plotly_chart(
                            plot_score_distribution(df, selected_col, f"Distribution: {selected_col}"),
                            use_container_width=True
                        )

                    with col2:
                        st.plotly_chart(
                            plot_performance_categories(df, selected_col, "Performance Categories"),
                            use_container_width=True
                        )
            else:
                st.warning("No numeric columns found in the dataset.")

        with tab2:
            st.markdown('<p class="sub-header">Performance Analysis</p>', unsafe_allow_html=True)

            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

            if numeric_cols:
                # Score column selection
                score_col = st.selectbox(
                    "Select score column",
                    numeric_cols,
                    key="perf_score_col"
                )

                # Pass/Fail Analysis
                st.markdown("#### Pass/Fail Analysis")
                passing_score = st.slider("Set passing score", 0, 100, 60)

                pass_fail_stats = analyzer.calculate_pass_fail_rate(score_col, passing_score)

                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("Total Students", pass_fail_stats['total_students'])
                with col2:
                    st.metric("Passed", pass_fail_stats['passed'])
                with col3:
                    st.metric("Failed", pass_fail_stats['failed'])
                with col4:
                    st.metric("Pass Rate", f"{pass_fail_stats['pass_rate']:.1f}%")

                st.plotly_chart(
                    plot_pass_fail_pie(pass_fail_stats),
                    use_container_width=True
                )

                # Top Performers
                st.markdown("#### 🏆 Top Performers")
                top_n = st.slider("Number of top performers to show", 5, 20, 10)
                top_performers = analyzer.get_top_performers(score_col, top_n)
                st.dataframe(top_performers, use_container_width=True)

                # Struggling Students
                st.markdown("#### 📉 Students Needing Support")
                threshold = st.slider("Threshold score", 0, 100, 50)
                struggling = analyzer.get_struggling_students(score_col, threshold, top_n)
                if not struggling.empty:
                    st.dataframe(struggling, use_container_width=True)
                else:
                    st.success("No students below the threshold!")

        with tab3:
            st.markdown('<p class="sub-header">Data Visualizations</p>', unsafe_allow_html=True)

            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

            if len(numeric_cols) >= 2:
                # Subject comparison (if multiple numeric columns)
                if len(numeric_cols) > 2:
                    st.markdown("#### Subject Performance Comparison")
                    selected_subjects = st.multiselect(
                        "Select subjects to compare",
                        numeric_cols,
                        default=numeric_cols[:min(5, len(numeric_cols))]
                    )

                    if selected_subjects:
                        subject_stats = analyzer.calculate_subject_averages(selected_subjects)
                        st.plotly_chart(
                            plot_subject_comparison(subject_stats),
                            use_container_width=True
                        )

                        st.plotly_chart(
                            plot_box_plot(df, selected_subjects),
                            use_container_width=True
                        )

                # Scatter plot
                st.markdown("#### Scatter Plot Analysis")
                col1, col2 = st.columns(2)
                with col1:
                    x_col = st.selectbox("X-axis", numeric_cols, key="scatter_x")
                with col2:
                    y_col = st.selectbox("Y-axis", numeric_cols, index=min(1, len(numeric_cols)-1), key="scatter_y")

                if x_col and y_col and x_col != y_col:
                    st.plotly_chart(
                        plot_scatter_with_trend(df, x_col, y_col),
                        use_container_width=True
                    )

        with tab4:
            st.markdown('<p class="sub-header">Correlation Analysis</p>', unsafe_allow_html=True)

            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

            if len(numeric_cols) >= 2:
                # Correlation matrix
                correlation_matrix = analyzer.identify_correlations(numeric_cols)

                st.plotly_chart(
                    plot_correlation_heatmap(correlation_matrix),
                    use_container_width=True
                )

                # Detailed correlation analysis
                st.markdown("#### Detailed Correlation Analysis")
                col1, col2 = st.columns(2)

                with col1:
                    var1 = st.selectbox("Variable 1", numeric_cols, key="corr_var1")
                with col2:
                    var2 = st.selectbox("Variable 2", numeric_cols, index=min(1, len(numeric_cols)-1), key="corr_var2")

                if var1 != var2:
                    corr_value = correlation_matrix.loc[var1, var2]
                    st.metric("Correlation Coefficient", f"{corr_value:.3f}")

                    if abs(corr_value) >= 0.7:
                        st.success(f"Strong correlation between {var1} and {var2}")
                    elif abs(corr_value) >= 0.4:
                        st.info(f"Moderate correlation between {var1} and {var2}")
                    else:
                        st.warning(f"Weak correlation between {var1} and {var2}")

                    st.plotly_chart(
                        plot_scatter_with_trend(df, var1, var2, f"{var1} vs {var2}"),
                        use_container_width=True
                    )
            else:
                st.warning("Need at least 2 numeric columns for correlation analysis.")

        with tab5:
            st.markdown('<p class="sub-header">Student Insights</p>', unsafe_allow_html=True)

            # Check if there's a student ID column
            potential_id_cols = [col for col in df.columns if 'id' in col.lower() or 'name' in col.lower()]

            if potential_id_cols:
                id_col = st.selectbox("Select Student ID/Name column", potential_id_cols)

                # Individual student analysis
                student_ids = df[id_col].unique()
                selected_student = st.selectbox("Select Student", student_ids)

                student_data = df[df[id_col] == selected_student].iloc[0]

                st.markdown(f"#### Student: {selected_student}")

                # Display student metrics
                numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
                if numeric_cols:
                    cols = st.columns(min(4, len(numeric_cols)))
                    for idx, col in enumerate(numeric_cols[:4]):
                        with cols[idx]:
                            st.metric(col, f"{student_data[col]:.1f}")

                    # Show all student data
                    with st.expander("View All Student Data"):
                        st.write(student_data.to_dict())
            else:
                st.info("No student ID or name column detected. Upload data with student identifiers for individual insights.")

        # Download section
        st.markdown('<p class="sub-header">💾 Download Analysis</p>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)

        with col1:
            # Download statistics
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            if numeric_cols:
                stats_df = analyzer.get_basic_statistics()
                csv = stats_df.to_csv()
                st.download_button(
                    label="📥 Download Statistics (CSV)",
                    data=csv,
                    file_name="educational_statistics.csv",
                    mime="text/csv"
                )

        with col2:
            # Download full data with grades
            if numeric_cols:
                df_download = df.copy()
                # Add letter grade for first numeric column
                df_download[f'{numeric_cols[0]}_Grade'] = df[numeric_cols[0]].apply(assign_letter_grades)
                csv = df_download.to_csv(index=False)
                st.download_button(
                    label="📥 Download Data with Grades (CSV)",
                    data=csv,
                    file_name="educational_data_with_grades.csv",
                    mime="text/csv"
                )

    else:
        # Welcome screen
        st.info("👈 Please upload a data file or select sample data from the sidebar to begin analysis.")

        st.markdown("### 🎯 Features")
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown("""
            #### 📊 Statistical Analysis
            - Comprehensive statistics
            - Grade distributions
            - Pass/fail rates
            - Performance trends
            """)

        with col2:
            st.markdown("""
            #### 📈 Visualizations
            - Interactive charts
            - Subject comparisons
            - Correlation heatmaps
            - Trend analysis
            """)

        with col3:
            st.markdown("""
            #### 🎓 Insights
            - Top performers
            - Struggling students
            - Individual tracking
            - Export reports
            """)

        st.markdown("### 📝 Getting Started")
        st.markdown("""
        1. **Upload your data** or use sample datasets
        2. **Explore** various analysis tabs
        3. **Visualize** performance metrics
        4. **Download** reports and insights

        **Supported formats:** CSV, Excel (.xlsx, .xls)
        """)


if __name__ == "__main__":
    main()
