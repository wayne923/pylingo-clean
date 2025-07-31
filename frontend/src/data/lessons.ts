export interface Lesson {
  id: number;
  title: string;
  description: string;
  initialCode: string;
  expectedOutput: string;
  hints: string[];
  track: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  validation: {
    requiredKeywords?: string[];
    forbiddenKeywords?: string[];
    mustContain?: string[];
    mustNotContain?: string[];
  };
}

// AI/ML Track Lessons - PyTorch to Transformers
const aiMlLessons: Lesson[] = [
  // PyTorch Fundamentals
  {
    id: 101,
    title: "PyTorch Tensors - Your First Neural Network Building Block",
    description: "Create a PyTorch tensor and perform basic operations. Tensors are the foundation of all deep learning.",
    initialCode: `import torch

# Create a 2x3 tensor with random values
# Print the tensor and its shape
`,
    expectedOutput: "torch.Size([2, 3])",
    hints: [
      "Use torch.randn(2, 3) to create a random tensor",
      "Use .shape to get tensor dimensions",
      "Print both the tensor and tensor.shape"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["pytorch", "tensors", "deep-learning"],
    validation: {
      requiredKeywords: ["torch", "randn", "shape"],
      mustContain: ["2", "3"]
    }
  },
  {
    id: 102,
    title: "Tensor Operations - Matrix Multiplication",
    description: "Learn matrix multiplication with PyTorch - the core operation in neural networks.",
    initialCode: `import torch

# Create two tensors: A (2x3) and B (3x2)
# Multiply them using torch.matmul() and print result
A = torch.randn(2, 3)
B = torch.randn(3, 2)

# Your code here
`,
    expectedOutput: "torch.Size([2, 2])",
    hints: [
      "Use torch.matmul(A, B) for matrix multiplication",
      "The result should be shape (2, 2)",
      "Print the result's shape"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["pytorch", "matrix-multiplication", "tensors"],
    validation: {
      requiredKeywords: ["torch.matmul", "print"],
      mustContain: ["A", "B"]
    }
  },
  {
    id: 103,
    title: "Your First Neural Network Layer",
    description: "Build a simple linear layer - the building block of neural networks.",
    initialCode: `import torch
import torch.nn as nn

# Create a linear layer that takes 3 inputs and outputs 1 value
# Test it with a random input tensor of shape (1, 3)

# Your code here
`,
    expectedOutput: "torch.Size([1, 1])",
    hints: [
      "Use nn.Linear(3, 1) to create the layer",
      "Create input with torch.randn(1, 3)",
      "Apply layer to input: output = layer(input)",
      "Print output.shape"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["pytorch", "neural-networks", "linear-layer"],
    validation: {
      requiredKeywords: ["nn.Linear", "torch.randn"],
      mustContain: ["3", "1"]
    }
  },
  {
    id: 104,
    title: "Training Your First Model - Gradient Descent",
    description: "Implement gradient descent to train a simple model. Learn the training loop that powers all AI.",
    initialCode: `import torch
import torch.nn as nn
import torch.optim as optim

# Simple model: y = 2x + 1 (we'll learn to predict this)
model = nn.Linear(1, 1)
optimizer = optim.SGD(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()

# Training data
X = torch.tensor([[1.0], [2.0], [3.0], [4.0]])
y = torch.tensor([[3.0], [5.0], [7.0], [9.0]])

# Train for 100 steps
for epoch in range(100):
    # Forward pass
    pred = model(X)
    loss = loss_fn(pred, y)
    
    # Backward pass
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# Test: what does the model predict for x=5?
test_input = torch.tensor([[5.0]])
print(f"Prediction for x=5: {model(test_input).item():.1f}")
`,
    expectedOutput: "Prediction for x=5: 11.0",
    hints: [
      "The model should learn y = 2x + 1",
      "For x=5, the answer should be close to 11",
      "The training loop: forward → loss → backward → step"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["pytorch", "gradient-descent", "training-loop", "optimization"],
    validation: {
      requiredKeywords: ["optimizer.zero_grad", "loss.backward", "optimizer.step"],
      mustContain: ["100", "5.0"]
    }
  },
  
  // NLP Fundamentals
  {
    id: 201,
    title: "Text Tokenization - Breaking Down Language",
    description: "Learn how to convert text into tokens that neural networks can understand.",
    initialCode: `import torch
from collections import Counter

# Simple tokenizer for the sentence: "hello world hello"
text = "hello world hello"
tokens = text.split()

# Create vocabulary: word -> index mapping
vocab = {word: i for i, word in enumerate(set(tokens))}

# Convert tokens to indices
token_ids = [vocab[token] for token in tokens]

print(f"Vocab: {vocab}")
print(f"Token IDs: {token_ids}")
`,
    expectedOutput: "Token IDs: [0, 1, 0]",
    hints: [
      "Use split() to tokenize the text",
      "Create vocab with enumerate(set(tokens))",
      "Map each token to its vocab index"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["nlp", "tokenization", "vocabulary"],
    validation: {
      requiredKeywords: ["split", "enumerate", "set"],
      mustContain: ["vocab", "token_ids"]
    }
  },
  {
    id: 202,
    title: "Word Embeddings - Giving Words Meaning",
    description: "Create word embeddings that capture semantic meaning of words in vector space.",
    initialCode: `import torch
import torch.nn as nn

# Vocabulary: {"hello": 0, "world": 1, "pytorch": 2}
vocab_size = 3
embedding_dim = 4

# Create embedding layer
embedding = nn.Embedding(vocab_size, embedding_dim)

# Get embeddings for tokens [0, 1, 2]
token_ids = torch.tensor([0, 1, 2])
embeddings = embedding(token_ids)

print(f"Embedding shape: {embeddings.shape}")
print(f"First word embedding: {embeddings[0]}")
`,
    expectedOutput: "Embedding shape: torch.Size([3, 4])",
    hints: [
      "Use nn.Embedding(vocab_size, embedding_dim)",
      "Pass token_ids through embedding layer",
      "Each word gets a 4-dimensional vector"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["nlp", "embeddings", "word-vectors"],
    validation: {
      requiredKeywords: ["nn.Embedding", "torch.tensor"],
      mustContain: ["3", "4"]
    }
  },
  {
    id: 203,
    title: "Attention Mechanism - The Heart of Transformers",
    description: "Implement the attention mechanism that revolutionized NLP and powers ChatGPT.",
    initialCode: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

def scaled_dot_product_attention(query, key, value):
    # Calculate attention scores
    d_k = query.size(-1)
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
    
    # Apply softmax to get attention weights
    attention_weights = F.softmax(scores, dim=-1)
    
    # Apply attention to values
    output = torch.matmul(attention_weights, value)
    
    return output, attention_weights

# Test with random Q, K, V (sequence_length=4, d_model=8)
seq_len, d_model = 4, 8
Q = torch.randn(1, seq_len, d_model)
K = torch.randn(1, seq_len, d_model)
V = torch.randn(1, seq_len, d_model)

output, weights = scaled_dot_product_attention(Q, K, V)
print(f"Output shape: {output.shape}")
print(f"Attention weights sum: {weights.sum(dim=-1)[0, 0]:.1f}")  # Should be 1.0
`,
    expectedOutput: "Attention weights sum: 1.0",
    hints: [
      "Attention = softmax(QK^T / √d_k)V",
      "Use torch.matmul for matrix multiplication",
      "Softmax makes weights sum to 1"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["attention", "transformers", "nlp", "self-attention"],
    validation: {
      requiredKeywords: ["torch.matmul", "F.softmax", "math.sqrt"],
      mustContain: ["scores", "attention_weights"]
    }
  },
  
  // Transformer Architecture
  {
    id: 301,
    title: "Multi-Head Attention - Parallel Processing",
    description: "Build multi-head attention that allows the model to focus on different aspects simultaneously.",
    initialCode: `import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, x):
        batch_size, seq_len, d_model = x.size()
        
        # Linear transformations and reshape for multi-head
        Q = self.W_q(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(batch_size, seq_len, self.num_heads, self.d_k).transpose(1, 2)
        
        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        attention = torch.softmax(scores, dim=-1)
        context = torch.matmul(attention, V)
        
        # Concatenate heads and apply output projection
        context = context.transpose(1, 2).contiguous().view(batch_size, seq_len, d_model)
        output = self.W_o(context)
        
        return output

# Test the multi-head attention
d_model, num_heads = 8, 2
mha = MultiHeadAttention(d_model, num_heads)
x = torch.randn(1, 4, d_model)  # batch_size=1, seq_len=4
output = mha(x)
print(f"Output shape: {output.shape}")
`,
    expectedOutput: "Output shape: torch.Size([1, 4, 8])",
    hints: [
      "Split d_model into num_heads",
      "Use view() and transpose() to reshape for parallel attention",
      "Concatenate heads back together"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["multi-head-attention", "transformers", "parallel-processing"],
    validation: {
      requiredKeywords: ["nn.Linear", "view", "transpose"],
      mustContain: ["W_q", "W_k", "W_v", "W_o"]
    }
  },
  {
    id: 302,
    title: "Transformer Block - Complete Architecture",
    description: "Build a complete transformer block with attention, normalization, and feed-forward layers.",
    initialCode: `import torch
import torch.nn as nn

class TransformerBlock(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(d_model, num_heads, dropout=dropout, batch_first=True)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # Feed-forward network
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model),
            nn.Dropout(dropout)
        )
        
    def forward(self, x):
        # Multi-head attention with residual connection
        attn_output, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_output)
        
        # Feed-forward network with residual connection
        ffn_output = self.ffn(x)
        x = self.norm2(x + ffn_output)
        
        return x

# Test transformer block
d_model, num_heads, d_ff = 8, 2, 32
transformer_block = TransformerBlock(d_model, num_heads, d_ff)

# Input: batch_size=1, seq_len=4, d_model=8
x = torch.randn(1, 4, d_model)
output = transformer_block(x)

print(f"Input shape: {x.shape}")
print(f"Output shape: {output.shape}")
print("Transformer block completed successfully!")
`,
    expectedOutput: "Transformer block completed successfully!",
    hints: [
      "Use residual connections: x = norm(x + sublayer(x))",
      "Apply layer normalization after each sublayer",
      "Feed-forward: Linear → ReLU → Linear"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["transformer-block", "residual-connections", "layer-norm", "feed-forward"],
    validation: {
      requiredKeywords: ["nn.MultiheadAttention", "nn.LayerNorm", "nn.Sequential"],
      mustContain: ["x + attn_output", "x + ffn_output"]
    }
  },
  
  // LLM Training and Fine-tuning
  {
    id: 401,
    title: "Building Your Own GPT - Language Model Architecture",
    description: "Create a complete GPT-style language model from scratch.",
    initialCode: `import torch
import torch.nn as nn
import math

class SimpleGPT(nn.Module):
    def __init__(self, vocab_size, d_model, num_heads, num_layers, max_seq_len):
        super().__init__()
        self.d_model = d_model
        
        # Embeddings
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        
        # Transformer layers
        self.transformer_blocks = nn.ModuleList([
            nn.TransformerDecoderLayer(d_model, num_heads, dim_feedforward=d_model*4, batch_first=True)
            for _ in range(num_layers)
        ])
        
        # Output head
        self.ln_f = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size)
        
    def forward(self, x):
        batch_size, seq_len = x.size()
        
        # Create position indices
        positions = torch.arange(seq_len, device=x.device).unsqueeze(0).expand(batch_size, -1)
        
        # Embeddings
        token_emb = self.token_embedding(x)
        pos_emb = self.position_embedding(positions)
        x = token_emb + pos_emb
        
        # Create causal mask (for autoregressive generation)
        mask = torch.triu(torch.ones(seq_len, seq_len, device=x.device), diagonal=1).bool()
        
        # Apply transformer blocks
        for block in self.transformer_blocks:
            x = block(x, x, tgt_mask=mask, memory_mask=mask)
        
        # Final layer norm and output projection
        x = self.ln_f(x)
        logits = self.head(x)
        
        return logits

# Create a small GPT model
vocab_size, d_model, num_heads, num_layers, max_seq_len = 1000, 128, 8, 4, 64
model = SimpleGPT(vocab_size, d_model, num_heads, num_layers, max_seq_len)

# Test with random input
batch_size, seq_len = 2, 10
input_ids = torch.randint(0, vocab_size, (batch_size, seq_len))
logits = model(input_ids)

print(f"Input shape: {input_ids.shape}")
print(f"Output logits shape: {logits.shape}")
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
`,
    expectedOutput: "Model parameters:",
    hints: [
      "Combine token and position embeddings",
      "Use causal mask for autoregressive generation",
      "Stack multiple transformer decoder layers"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["gpt", "language-model", "autoregressive", "causal-mask"],
    validation: {
      requiredKeywords: ["nn.Embedding", "nn.TransformerDecoderLayer", "torch.triu"],
      mustContain: ["token_embedding", "position_embedding", "causal"]
    }
  },
  {
    id: 402,
    title: "Fine-tuning Your LLM - Transfer Learning",
    description: "Learn to fine-tune a pre-trained language model for specific tasks.",
    initialCode: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset

class TextDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        # Simple tokenization (in practice, use a proper tokenizer)
        tokens = self.texts[idx].split()[:self.max_length]
        token_ids = [hash(token) % 1000 for token in tokens]  # Simple hash-based tokenization
        
        # Pad to max_length
        token_ids += [0] * (self.max_length - len(token_ids))
        
        return {
            'input_ids': torch.tensor(token_ids[:self.max_length]),
            'labels': torch.tensor(self.labels[idx], dtype=torch.long)
        }

# Sample classification task: sentiment analysis
texts = ["I love this movie", "This film is terrible", "Great acting and plot", "Boring and slow"]
labels = [1, 0, 1, 0]  # 1 = positive, 0 = negative

# Create dataset and dataloader
dataset = TextDataset(texts, labels, None)
dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

# Simple classifier on top of embeddings
class SentimentClassifier(nn.Module):
    def __init__(self, vocab_size=1000, embed_dim=64, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.classifier = nn.Sequential(
            nn.Linear(embed_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(32, num_classes)
        )
    
    def forward(self, input_ids):
        # Average embeddings across sequence length
        embeddings = self.embedding(input_ids)  # [batch, seq_len, embed_dim]
        pooled = embeddings.mean(dim=1)  # [batch, embed_dim]
        logits = self.classifier(pooled)
        return logits

# Initialize model and training
model = SentimentClassifier()
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

# Training loop
model.train()
for epoch in range(5):
    total_loss = 0
    for batch in dataloader:
        optimizer.zero_grad()
        
        logits = model(batch['input_ids'])
        loss = criterion(logits, batch['labels'])
        
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
    
    print(f"Epoch {epoch+1}, Loss: {total_loss/len(dataloader):.3f}")

print("Fine-tuning completed!")
`,
    expectedOutput: "Fine-tuning completed!",
    hints: [
      "Create a custom Dataset class for your data",
      "Use DataLoader for batching",
      "Add a classification head on top of embeddings",
      "Train with CrossEntropyLoss for classification"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["fine-tuning", "transfer-learning", "classification", "sentiment-analysis"],
    validation: {
      requiredKeywords: ["DataLoader", "CrossEntropyLoss", "optimizer.zero_grad"],
      mustContain: ["loss.backward", "optimizer.step"]
    }
  }
];

const originalLessons: Lesson[] = [
  {
    id: 1,
    title: "Your First Python Variable",
    description: "Create a variable called 'name' and assign it your name as a string, then print it.",
    initialCode: "# Write your code here\n",
    expectedOutput: "Hello, World!",
    hints: [
      "Use quotes around your name to make it a string",
      "Use the print() function to display the variable",
      "Variables are created with: variable_name = value"
    ],
    track: "beginner",
    difficulty: "beginner",
    concepts: ["variables", "strings", "print"],
    validation: {
      requiredKeywords: ["print"],
      mustContain: ["name", "="],
      forbiddenKeywords: ["\"Hello, World!\"", "'Hello, World!'"]
    }
  },
  {
    id: 2,
    title: "Working with Numbers",
    description: "Create two variables with numbers and print their sum.",
    initialCode: "# Create two number variables and add them\n",
    expectedOutput: "15",
    hints: [
      "Numbers don't need quotes",
      "Use + to add numbers",
      "Example: result = a + b"
    ],
    track: "beginner",
    difficulty: "beginner",
    concepts: ["variables", "numbers", "arithmetic"],
    validation: {
      requiredKeywords: ["print"],
      mustContain: ["=", "+"],
      forbiddenKeywords: ["15"]
    }
  },
  {
    id: 3,
    title: "String Formatting",
    description: "Use f-strings to create a greeting message with a name and age.",
    initialCode: "name = \"Alice\"\nage = 25\n# Create a greeting using f-strings\n",
    expectedOutput: "Hello Alice, you are 25 years old!",
    hints: [
      "F-strings start with f before the quotes",
      "Use curly braces {} to insert variables",
      "Example: f\"Hello {name}\""
    ],
    track: "beginner",
    difficulty: "beginner",
    concepts: ["strings", "f-strings", "variables"],
    validation: {
      requiredKeywords: ["print", "f\""],
      mustContain: ["{", "}", "name", "age"],
      forbiddenKeywords: ["\"Hello Alice, you are 25 years old!\"", "'Hello Alice, you are 25 years old!'", "25", "Alice"]
    }
  },
  {
    id: 4,
    title: "Lists and Indexing",
    description: "Create a list of fruits and print the second item.",
    initialCode: "# Create a list of fruits\n# Print the second fruit\n",
    expectedOutput: "banana",
    hints: [
      "Lists use square brackets: [item1, item2]",
      "Indexing starts at 0, so second item is index 1",
      "Access items with: list_name[index]"
    ],
    track: "beginner",
    difficulty: "beginner",
    concepts: ["lists", "indexing", "data-structures"],
    validation: {
      requiredKeywords: ["print"],
      mustContain: ["[", "]", "[1]", "="],
      forbiddenKeywords: ["\"banana\""]
    }
  },
  {
    id: 5,
    title: "For Loops",
    description: "Loop through a list of numbers and print each one.",
    initialCode: "numbers = [1, 2, 3, 4, 5]\n# Loop through and print each number\n",
    expectedOutput: "1\n2\n3\n4\n5",
    hints: [
      "Use 'for item in list:' syntax",
      "Don't forget the colon :",
      "Indent the code inside the loop"
    ],
    track: "beginner",
    difficulty: "beginner",
    concepts: ["loops", "iteration", "lists"],
    validation: {
      requiredKeywords: ["for", "in", ":", "print"],
      mustContain: ["numbers"]
    }
  },
  {
    id: 6,
    title: "Functions Basics",
    description: "Create a function that takes a name and returns a greeting.",
    initialCode: "# Define a function called greet\n# Call it with 'Python'\n",
    expectedOutput: "Hello, Python!",
    hints: [
      "Use 'def function_name(parameter):' syntax",
      "Use 'return' to send back a value",
      "Call the function with: function_name(argument)"
    ],
    track: "beginner",
    difficulty: "intermediate",
    concepts: ["functions", "parameters", "return"],
    validation: {
      requiredKeywords: ["def", "greet", "return", "print"],
      mustContain: [":", "(", ")", "Python"]
    }
  },
  {
    id: 7,
    title: "Dictionaries and Data",
    description: "Create a dictionary with student information and access specific values.",
    initialCode: "# Create a dictionary with name, age, and grade\n# Print the student's name\n",
    expectedOutput: "Alice",
    hints: [
      "Dictionaries use curly braces: {key: value}",
      "Access values with: dict_name[key]",
      "Keys should be strings in quotes"
    ],
    track: "intermediate",
    difficulty: "intermediate",
    concepts: ["dictionaries", "data-structures", "key-value"],
    validation: {
      requiredKeywords: ["print"],
      mustContain: ["{", "}", ":", "[", "]"],
      forbiddenKeywords: ["\"Alice\"", "'Alice'"]
    }
  },
  {
    id: 8,
    title: "Conditional Logic",
    description: "Write a function that checks if a number is positive, negative, or zero.",
    initialCode: "def check_number(num):\n    # Add your if/elif/else logic here\n    pass\n\n# Test with the number -5\nprint(check_number(-5))",
    expectedOutput: "negative",
    hints: [
      "Use if, elif, else statements",
      "Compare with 0 using >, <, ==",
      "Return the appropriate string"
    ],
    track: "intermediate",
    difficulty: "intermediate",
    concepts: ["conditionals", "functions", "logic"],
    validation: {
      requiredKeywords: ["if", "elif", "else", "return"],
      mustContain: ["<", ">", "=="],
      mustNotContain: ["pass"]
    }
  },
  {
    id: 9,
    title: "List Comprehensions",
    description: "Create a list of squares for numbers 1-5 using list comprehension.",
    initialCode: "# Create squares using list comprehension\n# squares = [your code here]\nprint(squares)",
    expectedOutput: "[1, 4, 9, 16, 25]",
    hints: [
      "List comprehensions: [expression for item in iterable]",
      "Use range(1, 6) for numbers 1-5",
      "Square a number with: num ** 2"
    ],
    track: "intermediate",
    difficulty: "intermediate",
    concepts: ["list-comprehensions", "loops", "expressions"],
    validation: {
      requiredKeywords: ["for", "in", "range"],
      mustContain: ["[", "]", "**"],
      forbiddenKeywords: ["[1, 4, 9, 16, 25]"]
    }
  },
  {
    id: 10,
    title: "Error Handling",
    description: "Handle division by zero using try/except blocks.",
    initialCode: "def safe_divide(a, b):\n    # Add try/except logic here\n    pass\n\nprint(safe_divide(10, 0))",
    expectedOutput: "Cannot divide by zero",
    hints: [
      "Use try: and except: blocks",
      "Catch ZeroDivisionError specifically",
      "Return appropriate error message"
    ],
    track: "intermediate",
    difficulty: "intermediate",
    concepts: ["error-handling", "exceptions", "functions"],
    validation: {
      requiredKeywords: ["try", "except", "return"],
      mustContain: ["ZeroDivisionError"],
      mustNotContain: ["pass"]
    }
  },
  {
    id: 11,
    title: "Working with Classes",
    description: "Create a simple Person class with name and age attributes.",
    initialCode: "# Define a Person class\n# Create an instance and print their name\n",
    expectedOutput: "John",
    hints: [
      "Use 'class ClassName:' syntax",
      "Define __init__ method for initialization",
      "Use self parameter in methods"
    ],
    track: "advanced",
    difficulty: "advanced",
    concepts: ["classes", "objects", "oop"],
    validation: {
      requiredKeywords: ["class", "def", "__init__", "self"],
      mustContain: [":", "(", ")"],
      forbiddenKeywords: ["\"John\"", "'John'"]
    }
  },
  {
    id: 12,
    title: "File Operations",
    description: "Read from a string as if it were a file and count the words.",
    initialCode: "from io import StringIO\n\ntext = \"Hello world Python programming\"\nfile_like = StringIO(text)\n# Read and count words\n",
    expectedOutput: "4",
    hints: [
      "Use .read() to get the content",
      "Use .split() to break into words",
      "Use len() to count items"
    ],
    track: "advanced",
    difficulty: "advanced",
    concepts: ["file-io", "strings", "methods"],
    validation: {
      requiredKeywords: ["read", "split", "len", "print"],
      mustContain: ["(", ")"],
      forbiddenKeywords: ["4"]
    }
  },
  // Data Science Track
  {
    id: 13,
    title: "Introduction to NumPy Arrays",
    description: "Create your first NumPy array and explore basic operations.",
    initialCode: "import numpy as np\n\n# Create a NumPy array from a list\n# Print the array and its shape\n",
    expectedOutput: "[1 2 3 4 5]\n(5,)",
    hints: [
      "Use np.array() to create arrays from lists",
      "Use .shape attribute to get array dimensions",
      "Print both the array and its shape on separate lines"
    ],
    track: "data-science",
    difficulty: "beginner",
    concepts: ["numpy", "arrays", "data-structures"],
    validation: {
      requiredKeywords: ["np.array", "print", ".shape"],
      mustContain: ["import numpy", "["],
      forbiddenKeywords: ["[1 2 3 4 5]", "(5,)"]
    }
  },
  {
    id: 14,
    title: "Array Operations and Math",
    description: "Perform mathematical operations on NumPy arrays.",
    initialCode: "import numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\n# Multiply the array by 2 and print the result\n",
    expectedOutput: "[ 2  4  6  8 10]",
    hints: [
      "NumPy arrays support element-wise operations",
      "Use * operator for multiplication",
      "Operations work on entire arrays at once"
    ],
    track: "data-science",
    difficulty: "beginner",
    concepts: ["numpy", "array-operations", "vectorization"],
    validation: {
      requiredKeywords: ["print", "*"],
      mustContain: ["arr", "2"],
      forbiddenKeywords: ["[ 2  4  6  8 10]"]
    }
  },
  {
    id: 15,
    title: "Introduction to Pandas DataFrames",
    description: "Create a simple DataFrame and display basic information.",
    initialCode: "import pandas as pd\n\n# Create a DataFrame with columns 'name' and 'age'\ndata = {'name': ['Alice', 'Bob', 'Charlie'], 'age': [25, 30, 35]}\n# Create DataFrame and print its shape\n",
    expectedOutput: "(3, 2)",
    hints: [
      "Use pd.DataFrame() to create DataFrames from dictionaries",
      "Use .shape attribute to get dimensions",
      "DataFrames are like spreadsheets with rows and columns"
    ],
    track: "data-science",
    difficulty: "beginner",
    concepts: ["pandas", "dataframes", "data-analysis"],
    validation: {
      requiredKeywords: ["pd.DataFrame", "print", ".shape"],
      mustContain: ["data"],
      forbiddenKeywords: ["(3, 2)"]
    }
  },
  {
    id: 16,
    title: "DataFrame Column Selection",
    description: "Select and manipulate specific columns from a DataFrame.",
    initialCode: "import pandas as pd\n\ndf = pd.DataFrame({\n    'name': ['Alice', 'Bob', 'Charlie'],\n    'age': [25, 30, 35],\n    'city': ['NYC', 'LA', 'Chicago']\n})\n\n# Select and print just the 'name' column\n",
    expectedOutput: "0      Alice\n1        Bob\n2    Charlie\nName: name, dtype: object",
    hints: [
      "Use df['column_name'] to select a column",
      "Column selection returns a pandas Series",
      "Print the selected column directly"
    ],
    track: "data-science",
    difficulty: "beginner",
    concepts: ["pandas", "dataframes", "column-selection"],
    validation: {
      requiredKeywords: ["print", "df["],
      mustContain: ["'name'", "]"],
      forbiddenKeywords: ["Alice", "Bob", "Charlie"]
    }
  },
  {
    id: 17,
    title: "Data Filtering with Pandas",
    description: "Filter DataFrame rows based on conditions.",
    initialCode: "import pandas as pd\n\ndf = pd.DataFrame({\n    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],\n    'age': [25, 30, 35, 28],\n    'salary': [50000, 60000, 70000, 55000]\n})\n\n# Filter and print rows where age > 28\n",
    expectedOutput: "    name  age  salary\n1    Bob   30   60000\n2  Charlie   35   70000",
    hints: [
      "Use df[condition] to filter rows",
      "Create condition with df['column'] > value",
      "Combine the condition with DataFrame selection"
    ],
    track: "data-science",
    difficulty: "intermediate",
    concepts: ["pandas", "filtering", "boolean-indexing"],
    validation: {
      requiredKeywords: ["print", "df[", ">"],
      mustContain: ["age", "28"],
      forbiddenKeywords: ["Bob", "Charlie"]
    }
  },
  {
    id: 18,
    title: "Data Aggregation with GroupBy",
    description: "Group data and calculate aggregate statistics.",
    initialCode: "import pandas as pd\n\ndf = pd.DataFrame({\n    'department': ['Sales', 'Engineering', 'Sales', 'Engineering', 'Marketing'],\n    'salary': [50000, 80000, 55000, 85000, 60000],\n    'experience': [2, 5, 3, 7, 4]\n})\n\n# Group by department and print mean salary\n",
    expectedOutput: "department\nEngineering    82500.0\nMarketing      60000.0\nSales          52500.0\nName: salary, dtype: float64",
    hints: [
      "Use df.groupby('column') to group data",
      "Chain with ['column'].mean() to get average",
      "GroupBy operations return aggregated results"
    ],
    track: "data-science",
    difficulty: "intermediate",
    concepts: ["pandas", "groupby", "aggregation"],
    validation: {
      requiredKeywords: ["groupby", "mean", "print"],
      mustContain: ["department", "salary"],
      forbiddenKeywords: ["82500", "52500"]
    }
  },
  {
    id: 19,
    title: "Data Visualization Basics",
    description: "Create a simple plot using matplotlib (output shows plot creation).",
    initialCode: "import matplotlib.pyplot as plt\nimport numpy as np\n\n# Create sample data\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2, 4, 6, 8, 10])\n\n# Create a line plot and show success message\nplt.plot(x, y)\nprint(\"Plot created successfully!\")\n",
    expectedOutput: "Plot created successfully!",
    hints: [
      "Use plt.plot(x, y) to create line plots",
      "Matplotlib works well with NumPy arrays",
      "Print the success message as shown"
    ],
    track: "data-science",
    difficulty: "intermediate",
    concepts: ["matplotlib", "visualization", "plotting"],
    validation: {
      requiredKeywords: ["plt.plot", "print"],
      mustContain: ["x", "y"],
      forbiddenKeywords: ["Plot created successfully!"]
    }
  },
  {
    id: 20,
    title: "Advanced Data Analysis",
    description: "Combine NumPy, Pandas, and statistical analysis.",
    initialCode: "import pandas as pd\nimport numpy as np\n\n# Create sample sales data\nnp.random.seed(42)\nsales_data = pd.DataFrame({\n    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],\n    'sales': np.random.randint(1000, 5000, 5),\n    'costs': np.random.randint(500, 2000, 5)\n})\n\n# Calculate and print the correlation between sales and costs\n",
    expectedOutput: "0.3424397441527667",
    hints: [
      "Use .corr() method to calculate correlation",
      "Access correlation between two columns with .corr()['col1']['col2']",
      "Correlation measures linear relationship strength"
    ],
    track: "data-science",
    difficulty: "advanced",
    concepts: ["pandas", "numpy", "correlation", "statistics"],
    validation: {
      requiredKeywords: ["corr", "print"],
      mustContain: ["sales", "costs"],
      forbiddenKeywords: ["0.3424397441527667"]
    }
  },
  // Advanced Docker-based lessons
  {
    id: 21,
    title: "Building a Simple Web API",
    description: "Create a Flask web application with multiple routes.",
    initialCode: "from flask import Flask, jsonify\n\n# Create Flask app\napp = Flask(__name__)\n\n# Add routes for /hello and /users\n# /hello should return {'message': 'Hello, World!'}\n# /users should return {'users': ['Alice', 'Bob']}\n\nif __name__ == '__main__':\n    print('Web app created successfully!')\n",
    expectedOutput: "Web app created successfully!",
    hints: [
      "Use @app.route('/path') to define routes",
      "Return jsonify() for JSON responses",
      "Create two separate route functions"
    ],
    track: "web-development",
    difficulty: "intermediate",
    concepts: ["flask", "web-apis", "routing"],
    validation: {
      requiredKeywords: ["@app.route", "jsonify", "return"],
      mustContain: ["/hello", "/users"],
      forbiddenKeywords: ["Web app created successfully!"]
    }
  },
  {
    id: 22,
    title: "Working with External Libraries",
    description: "Use the requests library to make HTTP calls (simulated).",
    initialCode: "# Simulate making an HTTP request\n# Since we can't make real requests, we'll simulate the response\n\ndef simulate_api_call(url):\n    # Simulate different responses based on URL\n    if 'users' in url:\n        return {'users': [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]}\n    elif 'posts' in url:\n        return {'posts': [{'id': 1, 'title': 'Hello World'}]}\n    else:\n        return {'error': 'Not found'}\n\n# Call the function with 'https://api.example.com/users' and print the result\n",
    expectedOutput: "{'users': [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]}",
    hints: [
      "Call simulate_api_call() with the URL",
      "Print the returned dictionary",
      "Make sure to include the full URL as shown"
    ],
    track: "web-development",
    difficulty: "intermediate",
    concepts: ["http-requests", "apis", "json"],
    validation: {
      requiredKeywords: ["simulate_api_call", "print"],
      mustContain: ["users"],
      forbiddenKeywords: ["{'users':", "Alice", "Bob"]
    }
  },
  {
    id: 23,
    title: "Database Operations with SQLite",
    description: "Create and query a SQLite database.",
    initialCode: "import sqlite3\n\n# Create in-memory database\nconn = sqlite3.connect(':memory:')\ncursor = conn.cursor()\n\n# Create table\ncursor.execute('''\n    CREATE TABLE students (\n        id INTEGER PRIMARY KEY,\n        name TEXT NOT NULL,\n        grade INTEGER\n    )\n''')\n\n# Insert data\ncursor.execute(\"INSERT INTO students (name, grade) VALUES ('Alice', 95)\")\ncursor.execute(\"INSERT INTO students (name, grade) VALUES ('Bob', 87)\")\nconn.commit()\n\n# Query and print all students with grade > 90\n",
    expectedOutput: "[(1, 'Alice', 95)]",
    hints: [
      "Use cursor.execute() with SELECT statement",
      "Add WHERE clause for grade > 90",
      "Use cursor.fetchall() to get results and print them"
    ],
    track: "web-development",
    difficulty: "advanced",
    concepts: ["sqlite", "databases", "sql"],
    validation: {
      requiredKeywords: ["SELECT", "WHERE", "fetchall", "print"],
      mustContain: [">", "90"],
      forbiddenKeywords: ["Alice", "95"]
    }
  },
  {
    id: 24,
    title: "File Processing and CSV",
    description: "Process CSV data and calculate statistics.",
    initialCode: "import csv\nfrom io import StringIO\n\n# Sample CSV data\ncsv_data = '''name,age,salary\nAlice,25,50000\nBob,30,60000\nCharlie,35,70000\nDiana,28,55000'''\n\n# Create CSV reader\ncsv_file = StringIO(csv_data)\nreader = csv.DictReader(csv_file)\n\n# Calculate and print the average salary\n",
    expectedOutput: "58750.0",
    hints: [
      "Iterate through the reader to get each row",
      "Convert salary values to integers",
      "Calculate average and print as float"
    ],
    track: "data-processing",
    difficulty: "intermediate",
    concepts: ["csv", "file-processing", "statistics"],
    validation: {
      requiredKeywords: ["for", "reader", "int", "print"],
      mustContain: ["salary"],
      forbiddenKeywords: ["58750"]
    }
  },
  {
    id: 25,
    title: "Advanced Error Handling",
    description: "Handle multiple types of exceptions gracefully.",
    initialCode: "def safe_divide_and_access(data, index, divisor):\n    # This function should:\n    # 1. Access data[index]\n    # 2. Divide the result by divisor\n    # 3. Handle IndexError, ZeroDivisionError, and TypeError\n    # 4. Return appropriate error messages or the result\n    pass\n\n# Test the function\ntest_data = [10, 20, 30]\nresult = safe_divide_and_access(test_data, 1, 4)\nprint(result)",
    expectedOutput: "5.0",
    hints: [
      "Use try/except blocks for each error type",
      "Handle IndexError for invalid indices",
      "Handle ZeroDivisionError for division by zero",
      "Return data[index] / divisor for valid inputs"
    ],
    track: "advanced",
    difficulty: "advanced",
    concepts: ["exception-handling", "error-types", "defensive-programming"],
    validation: {
      requiredKeywords: ["try", "except", "IndexError", "ZeroDivisionError", "return"],
      mustNotContain: ["pass"],
      forbiddenKeywords: ["5.0"]
    }
  },
  
  // Visualization Track - Advanced Data Visualization
  {
    id: 501,
    title: "Matplotlib Fundamentals - Your First Plot",
    description: "Create beautiful visualizations with matplotlib. Start with a simple line plot.",
    initialCode: `import matplotlib.pyplot as plt
import numpy as np

# Create data for a sine wave
x = np.linspace(0, 2*np.pi, 100)
y = np.sin(x)

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(x, y, label='sin(x)', color='blue', linewidth=2)
plt.title('Sine Wave Visualization')
plt.xlabel('x (radians)')
plt.ylabel('sin(x)')
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()

print("Sine wave plotted successfully!")
`,
    expectedOutput: "Sine wave plotted successfully!",
    hints: [
      "Use np.linspace() to create evenly spaced points",
      "plt.plot() creates the line plot",
      "Add labels, title, and grid for better presentation"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["matplotlib", "numpy", "visualization", "plotting"],
    validation: {
      requiredKeywords: ["plt.plot", "plt.title", "plt.xlabel", "plt.ylabel"],
      mustContain: ["np.sin", "plt.show"]
    }
  },
  {
    id: 502,
    title: "Advanced Visualizations - Seaborn Heatmaps",
    description: "Create insightful heatmaps and statistical plots with seaborn for data analysis.",
    initialCode: `import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Create sample correlation data
np.random.seed(42)
data = np.random.randn(100, 5)
columns = ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Target']
df = pd.DataFrame(data, columns=columns)

# Make some correlations more interesting
df['Feature A'] = df['Target'] * 0.7 + np.random.randn(100) * 0.3
df['Feature B'] = df['Target'] * -0.5 + np.random.randn(100) * 0.5

# Calculate correlation matrix
correlation_matrix = df.corr()

# Create heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, 
            annot=True, 
            cmap='coolwarm', 
            center=0,
            square=True,
            fmt='.2f')
plt.title('Feature Correlation Heatmap')
plt.tight_layout()
plt.show()

print(f"Correlation matrix shape: {correlation_matrix.shape}")
print("Heatmap visualization completed!")
`,
    expectedOutput: "Heatmap visualization completed!",
    hints: [
      "Use df.corr() to calculate correlations",
      "sns.heatmap() with annot=True shows values",
      "coolwarm colormap shows positive/negative correlations"
    ],
    track: "ai-ml",
    difficulty: "intermediate",
    concepts: ["seaborn", "heatmap", "correlation", "statistical-visualization"],
    validation: {
      requiredKeywords: ["sns.heatmap", "df.corr", "annot=True"],
      mustContain: ["correlation_matrix", "coolwarm"]
    }
  },
  {
    id: 503,
    title: "Interactive Visualizations - Plotly Dashboard",
    description: "Build interactive plots and dashboards with Plotly for dynamic data exploration.",
    initialCode: `import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np

# Generate sample time series data
dates = pd.date_range('2023-01-01', periods=365, freq='D')
np.random.seed(42)

# Simulate stock prices, user engagement, and model performance
stock_price = 100 + np.cumsum(np.random.randn(365) * 0.02)
user_engagement = 1000 + np.cumsum(np.random.randn(365) * 10)
model_accuracy = 0.85 + np.cumsum(np.random.randn(365) * 0.001)

df = pd.DataFrame({
    'date': dates,
    'stock_price': stock_price,
    'user_engagement': user_engagement,
    'model_accuracy': model_accuracy
})

# Create interactive subplot dashboard
fig = make_subplots(
    rows=3, cols=1,
    subplot_titles=('Stock Price Trend', 'User Engagement', 'Model Performance'),
    vertical_spacing=0.08
)

# Add traces
fig.add_trace(go.Scatter(x=df['date'], y=df['stock_price'], 
                         name='Stock Price', line=dict(color='green')), row=1, col=1)
fig.add_trace(go.Scatter(x=df['date'], y=df['user_engagement'], 
                         name='Users', line=dict(color='blue')), row=2, col=1)
fig.add_trace(go.Scatter(x=df['date'], y=df['model_accuracy'], 
                         name='Accuracy', line=dict(color='red')), row=3, col=1)

# Update layout
fig.update_layout(height=800, title_text="Interactive Business Dashboard")
fig.update_xaxes(title_text="Date")
fig.show()

print("Interactive dashboard created successfully!")
print(f"Data spans {len(df)} days")
`,
    expectedOutput: "Interactive dashboard created successfully!",
    hints: [
      "Use make_subplots() to create multi-panel layouts",
      "go.Scatter() creates interactive line plots",
      "fig.add_trace() adds plots to specific subplots"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["plotly", "interactive-visualization", "dashboard", "subplots"],
    validation: {
      requiredKeywords: ["make_subplots", "go.Scatter", "fig.add_trace"],
      mustContain: ["rows=3", "subplot_titles"]
    }
  },
  
  // Insights Generation Track
  {
    id: 601,
    title: "Statistical Insights - Automated Analysis",
    description: "Generate automated statistical insights from data using scipy and pandas.",
    initialCode: `import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# Generate sample sales data
np.random.seed(42)
n_samples = 1000

data = {
    'sales': np.random.exponential(100, n_samples),
    'marketing_spend': np.random.normal(50, 15, n_samples),
    'customer_satisfaction': np.random.beta(2, 1, n_samples) * 10,
    'region': np.random.choice(['North', 'South', 'East', 'West'], n_samples)
}

df = pd.DataFrame(data)
df['sales'] = df['sales'] + df['marketing_spend'] * 0.8  # Create correlation

def generate_insights(df):
    insights = []
    
    # Basic statistics
    for column in df.select_dtypes(include=[np.number]).columns:
        mean_val = df[column].mean()
        std_val = df[column].std()
        skewness = stats.skew(df[column])
        
        insights.append(f"{column}: Mean={mean_val:.2f}, Std={std_val:.2f}")
        
        if abs(skewness) > 1:
            direction = "right" if skewness > 0 else "left"
            insights.append(f"  ⚠️ {column} is highly {direction}-skewed (skew={skewness:.2f})")
    
    # Correlation analysis
    correlations = df.select_dtypes(include=[np.number]).corr()
    for i, col1 in enumerate(correlations.columns):
        for j, col2 in enumerate(correlations.columns):
            if i < j:  # Avoid duplicates
                corr_val = correlations.loc[col1, col2]
                if abs(corr_val) > 0.5:
                    strength = "strong" if abs(corr_val) > 0.7 else "moderate"
                    direction = "positive" if corr_val > 0 else "negative"
                    insights.append(f"🔗 {strength.title()} {direction} correlation between {col1} and {col2}: {corr_val:.3f}")
    
    # Outlier detection
    for column in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        outliers = df[(df[column] < Q1 - 1.5*IQR) | (df[column] > Q3 + 1.5*IQR)]
        
        if len(outliers) > 0:
            outlier_pct = (len(outliers) / len(df)) * 100
            insights.append(f"📊 {column} has {len(outliers)} outliers ({outlier_pct:.1f}% of data)")
    
    return insights

# Generate and display insights
insights = generate_insights(df)
print("🔍 AUTOMATED DATA INSIGHTS:")
print("=" * 40)
for insight in insights:
    print(insight)

print(f"\\n✅ Generated {len(insights)} insights from {len(df)} data points")
`,
    expectedOutput: "Generated",
    hints: [
      "Use stats.skew() to detect data distribution shape",
      "Calculate correlations with df.corr()",
      "Use IQR method for outlier detection"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["statistical-analysis", "insights", "outlier-detection", "correlation"],
    validation: {
      requiredKeywords: ["stats.skew", "df.corr", "quantile"],
      mustContain: ["insights", "outliers", "correlation"]
    }
  },
  {
    id: 602,
    title: "ML-Powered Insights - Anomaly Detection",
    description: "Use machine learning to automatically detect anomalies and generate business insights.",
    initialCode: `import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Generate realistic business metrics data
np.random.seed(42)
n_days = 365

# Normal business patterns
base_revenue = 10000
seasonal_trend = 2000 * np.sin(2 * np.pi * np.arange(n_days) / 365.25)
weekly_pattern = 1000 * np.sin(2 * np.pi * np.arange(n_days) / 7)
noise = np.random.normal(0, 500, n_days)

revenue = base_revenue + seasonal_trend + weekly_pattern + noise

# Inject some anomalies
anomaly_days = [50, 120, 200, 300]
for day in anomaly_days:
    revenue[day] += np.random.choice([-5000, 8000])  # Big drops or spikes

# Create dataset
data = {
    'day': range(n_days),
    'revenue': revenue,
    'marketing_spend': np.random.normal(2000, 300, n_days),
    'customer_visits': revenue * 0.1 + np.random.normal(0, 100, n_days),
    'conversion_rate': np.random.beta(2, 20, n_days) * 100
}

df = pd.DataFrame(data)

# Anomaly Detection Pipeline
def detect_anomalies_and_insights(df):
    # Prepare features for anomaly detection
    feature_cols = ['revenue', 'marketing_spend', 'customer_visits', 'conversion_rate']
    X = df[feature_cols]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Detect anomalies using Isolation Forest
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    anomaly_labels = iso_forest.fit_predict(X_scaled)
    
    # Add anomaly labels to dataframe
    df['is_anomaly'] = anomaly_labels == -1
    anomalies = df[df['is_anomaly']]
    
    insights = []
    insights.append(f"🚨 Detected {len(anomalies)} anomalous days out of {len(df)} total days")
    
    # Analyze anomalies
    for _, anomaly in anomalies.iterrows():
        day = int(anomaly['day'])
        revenue = anomaly['revenue']
        avg_revenue = df['revenue'].mean()
        deviation = ((revenue - avg_revenue) / avg_revenue) * 100
        
        if revenue > avg_revenue:
            insights.append(f"📈 Day {day}: Revenue spike of \${revenue:,.0f} ({deviation:+.1f}% vs average)")
        else:
            insights.append(f"📉 Day {day}: Revenue drop to \${revenue:,.0f} ({deviation:+.1f}% vs average)")
    
    # Business performance insights
    total_revenue = df['revenue'].sum()
    avg_daily_revenue = df['revenue'].mean()
    revenue_growth = (df['revenue'].iloc[-30:].mean() - df['revenue'].iloc[:30].mean()) / df['revenue'].iloc[:30].mean() * 100
    
    insights.append(f"💰 Total annual revenue: \${total_revenue:,.0f}")
    insights.append(f"📊 Average daily revenue: \${avg_daily_revenue:,.0f}")
    insights.append(f"📈 Revenue growth (last 30 vs first 30 days): {revenue_growth:+.1f}%")
    
    # Correlation insights
    corr_matrix = df[feature_cols].corr()
    strongest_corr = corr_matrix.abs().unstack().drop_duplicates().sort_values(ascending=False)
    strongest_corr = strongest_corr[strongest_corr < 1.0].iloc[0]
    
    corr_pair = strongest_corr.name
    corr_value = strongest_corr
    insights.append(f"🔗 Strongest correlation: {corr_pair[0]} vs {corr_pair[1]} (r={corr_value:.3f})")
    
    return insights, anomalies

# Generate insights
insights, anomalies = detect_anomalies_and_insights(df)

print("🤖 ML-POWERED BUSINESS INSIGHTS:")
print("=" * 45)
for insight in insights:
    print(insight)

print(f"\\n✅ ML analysis completed on {len(df)} days of business data")
`,
    expectedOutput: "ML analysis completed",
    hints: [
      "Use IsolationForest for unsupervised anomaly detection",
      "StandardScaler normalizes features for ML algorithms",
      "Calculate percentage deviations for business context"
    ],
    track: "ai-ml",
    difficulty: "advanced",
    concepts: ["anomaly-detection", "isolation-forest", "business-intelligence", "ml-insights"],
    validation: {
      requiredKeywords: ["IsolationForest", "StandardScaler", "fit_predict"],
      mustContain: ["anomaly", "insights", "contamination"]
    }
  }
];

// Combine all lessons
export const lessons: Lesson[] = [...aiMlLessons, ...originalLessons];