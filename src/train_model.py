import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping

# =========================
# 1. Load dataset
# =========================
data = np.load("data/dataset.npz")

X = data["X"]
y = data["y"]

# =========================
# 2. Reshape for CNN
# =========================
X = X[..., np.newaxis]   # (samples, 128,128,1)

# =========================
# 3. Encode labels
# =========================
le = LabelEncoder()
y = le.fit_transform(y)

# =========================
# 4. Train-test split
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# 5. CNN Model
# =========================
model = models.Sequential([
    layers.Conv2D(32, (3,3), activation='relu', input_shape=(128,128,1)),
    layers.MaxPooling2D(2,2),

    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),

    layers.Conv2D(128, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),

    layers.Conv2D(256, (3,3), activation='relu'),
    layers.MaxPooling2D(2,2),

    layers.Flatten(),

    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),

    layers.Dense(len(set(y)), activation='softmax')
])

# =========================
# 6. Compile model
# =========================
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# =========================
# 7. Early Stopping
# =========================
early_stop = EarlyStopping(
    monitor='val_loss',
    patience=2,
    restore_best_weights=True
)

# =========================
# 8. Train model
# =========================
model.fit(
    X_train, y_train,
    epochs=20,
    validation_data=(X_test, y_test),
    callbacks=[early_stop]
)

# =========================
# 9. Evaluate model
# =========================
loss, acc = model.evaluate(X_test, y_test)
print("Final Accuracy:", acc)