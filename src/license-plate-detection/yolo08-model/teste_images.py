from ultralytics import YOLO
import cv2
import os

# pasta com imagens para teste
INPUT_FOLDER = "images_test"

# pasta de output das iamgens testadas
OUTPUT_FOLDER = "outputs_test"
if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

# carrega o modelo
model = YOLO("license_plate_detector.pt")

# filtra elista arquivos de imagem
formatos_validos = (".jpg", ".jpeg", ".png")
imagens = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(formatos_validos)]

print(f"Encontradas {len(imagens)} imagens para teste.")

# percorre cada imagem
for nome_arquivo in imagens:
    caminho_imagem = os.path.join(INPUT_FOLDER, nome_arquivo)
    
    # leitura das imagens que vira uma matriz NumPy
    img = cv2.imread(caminho_imagem)
    if img is None:
        continue

    # análise das imagens
    results = model(img, conf=0.5, verbose=False)

    if len(results[0].boxes) > 0:
        print(f"Placa detectada em: {nome_arquivo}")
        
        # plota bounding box e salva arquivo
        img_resultado = results[0].plot()
        cv2.imwrite(os.path.join(OUTPUT_FOLDER, f"res_{nome_arquivo}"), img_resultado)
        
        # janela que mostra a imagem detectada
        cv2.imshow("Validacao de Teste", img_resultado)
        
        if cv2.waitKey(1000) & 0xFF == ord('q'): # q para 
            break
    else:
        print(f"Nenhuma placa encontrada em: {nome_arquivo}")

# fecha processamento
cv2.destroyAllWindows()
print("Processamento de teste concluído.")