# 📊 Educational Data Analysis App

A comprehensive, interactive web application built with Streamlit for analyzing educational data, tracking student performance, and generating insights for educators and administrators.

## 🎯 Features

### Statistical Analysis
- **Comprehensive Statistics**: Mean, median, standard deviation, min/max values
- **Grade Distributions**: Automatic letter grade assignment and distribution analysis
- **Pass/Fail Rates**: Customizable passing thresholds with visual representations
- **Performance Trends**: Track student progress over time

### Visualizations
- **Interactive Charts**: Plotly-based interactive visualizations
- **Multiple Chart Types**: Histograms, box plots, scatter plots, pie charts, heatmaps
- **Subject Comparisons**: Compare performance across multiple subjects
- **Correlation Analysis**: Identify relationships between variables

### Student Insights
- **Top Performers**: Identify and track high-achieving students
- **Students Needing Support**: Automatically identify struggling students
- **Individual Analysis**: Detailed insights for individual students
- **Attendance Impact**: Analyze the relationship between attendance and performance

### Data Management
- **Multiple Formats**: Support for CSV and Excel files
- **Sample Datasets**: Three pre-loaded sample datasets for testing
- **Data Export**: Download analysis results and enhanced datasets
- **Data Preview**: Interactive data table viewer

## 🚀 Quick Start

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SUMRY
```

2. **Create a virtual environment (recommended)**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

### Running the App

Start the Streamlit application:
```bash
streamlit run app.py
```

The app will automatically open in your default web browser at `http://localhost:8501`

## 📖 Usage Guide

### 1. Loading Data

#### Option A: Use Sample Data
- Click "Use Sample Data" in the sidebar
- Select from three pre-loaded datasets:
  - **Student Grades**: Individual student performance across subjects
  - **Class Performance**: Quiz, exam, and project scores
  - **Multi-Subject Analysis**: Comprehensive academic records

#### Option B: Upload Your Own Data
- Click "Upload File" in the sidebar
- Upload a CSV or Excel file
- Ensure your data includes:
  - Student identifiers (ID or Name)
  - Numeric score columns
  - Optional: Attendance, demographic data

### 2. Exploring Analysis Tabs

#### 📊 Overview Tab
- View basic statistical summary
- See data distribution histograms
- Analyze performance categories

#### 📈 Performance Analysis Tab
- Set custom passing scores
- View pass/fail statistics
- Identify top performers
- Find students needing support

#### 📉 Visualizations Tab
- Compare subject performance
- Create box plots for score distributions
- Generate custom scatter plots
- Analyze trends visually

#### 🔍 Correlations Tab
- View correlation heatmap
- Analyze relationships between variables
- Get detailed correlation statistics
- Identify strong/weak correlations

#### 👥 Student Insights Tab
- Select individual students
- View detailed student metrics
- Access complete student records

### 3. Downloading Results

- **Download Statistics**: Export statistical summary as CSV
- **Download Enhanced Data**: Export original data with calculated grades

## 📁 Project Structure

```
SUMRY/
├── app.py                      # Main Streamlit application
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── .gitignore                 # Git ignore rules
├── data/                      # Sample datasets
│   ├── sample_student_grades.csv
│   ├── sample_class_performance.csv
│   └── sample_multi_subject.csv
├── src/                       # Source modules
│   ├── data_analyzer.py       # Data analysis functions
│   └── visualizations.py      # Visualization functions
└── docs/                      # Documentation
    └── USER_GUIDE.md          # Detailed user guide
```

## 🔧 Data Format Requirements

### Required Columns
Your dataset should include at least:
- One identifier column (Student ID, Name, etc.)
- One or more numeric score columns

### Optional Columns
- **Attendance**: Percentage or count
- **Demographics**: Age, grade level, etc.
- **Multiple Assessments**: Quiz scores, exams, projects

### Example CSV Format
```csv
Student_ID,Name,Math,Science,English,Attendance
S001,Alice,92,88,95,98
S002,Bob,78,82,76,92
...
```

## 📊 Analysis Capabilities

### Statistical Measures
- Mean, Median, Mode
- Standard Deviation
- Quartiles and Percentiles
- Min/Max Values
- Range and IQR

### Visualizations Available
- Histograms (Score Distributions)
- Bar Charts (Grade Distributions)
- Box Plots (Subject Comparisons)
- Scatter Plots (Correlations)
- Pie Charts (Pass/Fail Rates)
- Heatmaps (Correlation Matrices)
- Line Charts (Trend Analysis)

### Advanced Features
- Pearson Correlation Coefficient
- Trend Line Analysis
- Performance Categorization
- Attendance Impact Analysis
- Multi-variable Correlation

## 🎓 Use Cases

### For Teachers
- Track class performance over time
- Identify students who need extra help
- Analyze test difficulty and effectiveness
- Compare performance across different topics

### For Administrators
- Generate reports on school-wide performance
- Identify curriculum strengths and weaknesses
- Analyze attendance impact on grades
- Track academic trends

### For Researchers
- Analyze large educational datasets
- Study correlations between variables
- Generate publication-ready visualizations
- Export data for further statistical analysis

## 🛠️ Technical Details

### Built With
- **Streamlit** (1.29.0): Web application framework
- **Pandas** (2.1.3): Data manipulation and analysis
- **Plotly** (5.18.0): Interactive visualizations
- **Matplotlib** (3.8.2) & **Seaborn** (0.13.0): Static visualizations
- **NumPy** (1.26.2): Numerical computations
- **SciPy** (1.11.4): Statistical analysis

### Python Version
- Python 3.8 or higher recommended

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests.

### Development Setup
```bash
# Install development dependencies
pip install -r requirements.txt

# Run tests (if available)
pytest

# Format code
black .
```

## 📝 License

This project is open source and available under the MIT License.

## 📧 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `docs/USER_GUIDE.md`

## 🎉 Acknowledgments

- Built with Streamlit
- Visualization powered by Plotly
- Data analysis using Pandas and NumPy

## 🔄 Version History

### Version 1.0.0 (Initial Release)
- Complete statistical analysis suite
- Interactive visualizations
- Sample datasets included
- Data export functionality
- Multi-tab interface
- Comprehensive documentation

## 🚦 Getting Help

If you encounter issues:
1. Check the `docs/USER_GUIDE.md` for detailed instructions
2. Verify your data format matches the requirements
3. Ensure all dependencies are installed correctly
4. Review sample datasets for format examples

---

**Made with ❤️ for educators and students worldwide**
