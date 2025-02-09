import spacy

nlp = spacy.load("en_core_web_sm")  # Load English NLP model

text = "find me a movie from 2009 with Brad Pitt and Angelina Jolie"
doc = nlp(text)

actors = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
print(actors)  # ['Brad Pitt', 'Angelina Jolie']
