from djitellopy import Tello
from ultralytics import YOLO
import cv2
import time
import os

# pasta para salvar as imagens
path = "output"
cooldown = 10
if not os.path.exists(path):
    os.makedirs(path)

# carrega o modelo treinado
model = YOLO("license_plate_detector.pt")

# conexão via wi-fi
tello = Tello()
tello.connect()

print(f"Bateria: {tello.get_battery()}%")

# liga a câmera do drone
tello.streamon()
time.sleep(2)

# captura frames do vídeo do drone
frame_read = tello.get_frame_read()

last_save_time = 0

print("Sistema iniciado.")
print("Mostre uma placa para a câmera.")

print("Sistema iniciado.")
cv2.namedWindow("Tello", cv2.WINDOW_NORMAL)
cv2.startWindowThread()

try:

    while True:
        frame = frame_read.frame
        if frame is None:
            print("Aguardando frame de vídeo do drone...")
            time.sleep(0.5)
            continue

        results = model(frame, conf=0.5, verbose=False)

        if len(results[0].boxes) > 0:
            current_time = time.time()

            if current_time - last_save_time > cooldown:
                timestamp = time.strftime("%Y%m%d-%H%M%S")
                filename = f"placa_detectada_{timestamp}.jpg"
                filepath = os.path.join(path, filename) 

                cv2.imwrite(filepath, frame)
                print(f"Placa detectada! Imagem salva em: {filepath}")
                last_save_time = current_time

        img_visualizacao = results[0].plot()
        cv2.imshow("Tello", img_visualizacao)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# cancela conexão com o drone
finally:
    cv2.destroyAllWindows()
    tello.streamoff()
    tello.end()
    print("Conexão encerrada.")