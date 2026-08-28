from PIL import Image

def remove_background(image_path, output_path, tolerance=20):
    img = Image.open(image_path).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    # Get the background color from top-left pixel
    bg_color = data[0, 0]
    
    # Queue for BFS
    queue = [(0, 0)]
    visited = set([(0, 0)])
    
    def color_dist(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
        
    while queue:
        x, y = queue.pop(0)
        
        # Check current pixel
        if color_dist(data[x, y], bg_color) <= tolerance:
            data[x, y] = (255, 255, 255, 0) # Make transparent
            
            # Add neighbors
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    img.save(output_path)
    print("Done")

remove_background("ml-logo.png", "ml-logo.png")
