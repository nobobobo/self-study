# LLM & Deep Learning Learning Journey

## Overview
This repository is a monorepo dedicated to an intensive 2-month learning journey, focusing on mastering Deep Learning, Natural Language Processing, and Large Language Models (LLMs) from scratch. 
The workflow heavily integrates **Claude Code (Anthropic CLI)** to accelerate development by delegating boilerplate code generation and debugging to the AI agent, allowing the user to focus on writing the core algorithmic logic manually.

## Books Covered
1. Practical Claude Code Introduction (実践Claude Code 入門)
2. Deep Learning from Scratch 1: Basic DL (ゼロから作るディープラーニング 1)
3. Deep Learning from Scratch 2: NLP (ゼロから作るディープラーニング 2)
4. Deep Learning from Scratch 3: Framework (ゼロから作るディープラーニング 3)
5. Deep Learning from Scratch 4: Reinforcement Learning (ゼロから作るディープラーニング 4)
6. Deep Learning from Scratch 5: Generative Models (ゼロから作るディープラーニング 5)
7. Modern Transformer (モダン Transformer)
8. Deep Learning from Scratch 6: LLM (ゼロから作るディープラーニング 6)

## Directory Structure
```text
llm-learning-journey/
├── CLAUDE.md                 # System prompts and rules for Claude Code CLI
├── README.md                 # This file
├── pyproject.toml            # Dependency management
├── data/                     # Shared datasets (ignored in git)
├── outputs/                  # Model weights, plots, and logs (ignored in git)
├── shared_utils/             # Shared boilerplate code (e.g., plot.py, data_loader.py)
├── 00_claude_code/           
├── 01_zero_dl_1_basic/       
├── 02_zero_dl_2_nlp/         
├── 03_zero_dl_3_framework/   
├── 04_zero_dl_4_rl/          
├── 05_zero_dl_5_gen_model/   
├── 06_modern_transformer/    
└── 07_zero_dl_6_llm/         
```

## Learning Strategy & Workflow
- **Core Logic (Manual Coding):** Core algorithms (e.g., Backpropagation, Attention mechanisms, DeZero engine) are implemented manually to ensure deep understanding.
- **Boilerplate Delegation (Claude Code):** Peripheral tasks such as data loading, training loops, and Matplotlib visualizations are delegated to Claude Code.
- **Debugging:** Leverage Claude Code to autonomously debug shape mismatches and runtime errors in the terminal.