Personalized Ayurvedic Meal Planner

A web-based AI-powered Ayurvedic Meal Recommendation System that provides personalized dietary guidance based on user inputs. The system recommends a well-balanced meal, calculates nutrient values, suggests foods to avoid, and identifies the dominant dosha according to Ayurvedic principles.

📝 Features

Personalized Meal Plans: Input your age, gender, disease, meal category, food preference, and activity level to receive a customized Ayurvedic meal plan.

Nutrient Summary: Calories, protein, carbohydrates, and fat are calculated for the recommended meal.

Foods to Avoid: Shows foods that should be limited or avoided based on disease and user inputs.

Dosha Identification: Determines the dominant dosha (Vata, Pitta, Kapha) for the user.

Frontend & Backend Integration: React frontend with FastAPI backend for real-time responses.

Future Enhancement: Option to generate daily/weekly/monthly health reports.

📂 Dataset

The current dataset contains 1000 records with the following features:

Feature	Description
disease	Name of the disease (e.g., Diabetes, Gastritis)
age_category	Child, Adult, Senior
gender	Male, Female
meal_category	Breakfast, Lunch, Dinner
food_preference	Veg, Non-Veg, Mixed
activity_level	Light, Moderate, High
dominant_dosha	Vata, Pitta, Kapha
dosha_state	Current dosha condition
recommended_foods	Foods recommended for the user
foods_to_avoid	Foods to avoid based on inputs
total_calories	Total calories in recommended meal
total_protein	Total protein in grams
total_carbs	Total carbohydrates in grams
total_fat	Total fat in grams

Future versions may include additional records (e.g., 2500+) and six tastes representation for more accurate Ayurvedic recommendations.

⚙️ Tech Stack

Frontend:

React.js

CSS (Deep Forest Green, White, Black theme)

Vite as build tool

Backend:

Python FastAPI

scikit-learn (Random Forest)

pandas, numpy

🧪 Model Training

The system uses a Random Forest Classifier for multi-output prediction of meals.

Metrics tracked: F1 Score, Accuracy, Precision, Recall.

Current performance (on test set):

F1 Score: 0.80

Accuracy, Precision, Recall: calculated per run using train/test split.

The model is trained on encoded features like age, gender, disease, meal category, food preference, and activity level.

🎯 Future Enhancements

Expand dataset to 2500+ records for better model accuracy.

Add six tastes representation for complete Ayurvedic meal analysis.

Enable health report generation (daily, weekly, monthly) with downloadable PDFs.

Support user login and personalized history tracking.

🧑‍💻 Author

Nethni Maheshya Dias – SLIIT 


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

