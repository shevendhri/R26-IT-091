import time
import os
import psutil
import joblib

def measure_load():
    process = psutil.Process(os.getpid())
    mem_before = process.memory_info().rss
    
    start_time = time.time()
    model = joblib.load('ml/greenconstruct_model.pkl')
    end_time = time.time()
    
    mem_after = process.memory_info().rss
    
    load_time = end_time - start_time
    mem_used = mem_after - mem_before
    
    file_size = os.path.getsize('ml/greenconstruct_model.pkl')
    
    print(f"Model file size: {file_size / (1024**2):.2f} MB")
    print(f"Load time: {load_time:.4f} seconds")
    print(f"Memory consumption during load: {mem_used / (1024**2):.2f} MB")

if __name__ == '__main__':
    measure_load()
