# wildlife-audio-project



# 🐦 Wildlife Audio Detection Project

## 📌 Step 1: Project Setup

### 🧠 Objective
To build a machine learning model that can identify wildlife species from audio recordings.

---

## 👥 Team Members
- Nadeem Rashid
- Harsh Anand
---

## 🛠 Tools & Technologies
- Python
- Git & GitHub
- VS Code
- Kaggle

---

## 📁 Project Structure
# 🐦 Wildlife Audio Detection Project

## 📌 Step 1: Project Setup

### 🧠 Objective
To build a machine learning model that can identify wildlife species from audio recordings.


## 🛠 Tools & Technologies
- Python
- Git & GitHub
- VS Code
- Kaggle

---

## 📁 Project Structure
wildlife-audio-project/
├── data/
├── src/
├── notebooks/
├── models/
├── submission/
├── README.md


---

## 🔧 Setup Done

- Created GitHub repository
- Added collaborator
- Cloned project in VS Code
- Created project folder structure
- Added `.gitkeep` files to maintain folders
- Created `.gitignore` to ignore:
  - data/
  - venv/
  - audio files (.wav, .ogg)

---

## ⚠️ Important Notes

- Dataset is NOT uploaded to GitHub
- Data is stored locally in `data/` folder
- GitHub is used only for code sharing

---

## ✅ Outcome

- Project environment successfully set up
- Team collaboration established
- Ready for data processing and model development

---

## 🚀 Next Step

Step 2: Data Collection & Preprocessing

## 📌 Step 2: Data & Feature Extraction

### 📥 Data
- Dataset from Kaggle (BirdCLEF)
- Used sample: ~33 species, ~150 audio files
- Data stored in `data/` folder (species-wise folders)

---

### 🧠 Labeling
- Folder name = label (species)
- No CSV required

---

### 🎧 Feature Extraction
- Loaded audio using `librosa`
- Converted audio → Mel Spectrogram
- Converted to decibel scale
- Fixed size to 128×128 (padding/trimming)

---

### 📊 Output
- X → Features (spectrograms)
- y → Labels (species)

