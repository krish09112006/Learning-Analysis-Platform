<?php
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['courseName']) || empty(trim($data['courseName']))) {
    http_response_code(400);
    echo json_encode(["error" => "Course name is required."]);
    exit();
}

$course_name = trim($data['courseName']);
$description = trim($data['description'] ?? '');
$topics_raw = $data['topics'] ?? [];
$difficulty = $data['difficulty'] ?? 'Beginner';
$duration = $data['duration'] ?? '8 Weeks';
$study_hours = $data['studyHours'] ?? '40 Hours';
$target_students = $data['targetStudents'] ?? 'General students';
$language = $data['language'] ?? 'English';
$important_points = $data['importantPoints'] ?? [];
$additional_instructions = trim($data['additionalInstructions'] ?? '');
$quiz_prefs = $data['quizPreferences'] ?? ['questionsPerModule' => 5, 'difficulty' => 'Easy'];

// Check API key
$gemini_api_key = getenv('GEMINI_API_KEY') ?: '';
$openai_api_key = getenv('OPENAI_API_KEY') ?: '';

$generated_course = null;

if (!empty($gemini_api_key)) {
    $prompt = "You are an expert curriculum architect. Generate a complete academic course draft based on these inputs:
Course Name: {$course_name}
Description: {$description}
Topics: " . json_encode($topics_raw) . "
Important Points: " . json_encode($important_points) . "
Difficulty: {$difficulty}
Duration: {$duration}
Target Students: {$target_students}
Additional Instructions: {$additional_instructions}

STRICT RULES:
1. Use the teacher's provided topics as the primary source.
2. Do not remove teacher-provided topics.
3. Group related topics into logical modules.
4. Keep the course appropriate for {$difficulty} difficulty.
5. Generate measurable action-oriented learning objectives (Bloom's taxonomy: Explain, Identify, Implement, Calculate, Compare, Analyze, Create) for every module.
6. Generate practical code examples and practice activities for every topic.
7. Generate a quiz for every module containing " . ($quiz_prefs['questionsPerModule'] ?? 5) . " questions.
8. Generate a final assessment covering all topics with topic coverage distribution percentage.
9. Return ONLY valid JSON matching this schema:
{
  \"course\": {
    \"title\": \"{$course_name}\",
    \"description\": \"...\",
    \"difficulty\": \"{$difficulty}\",
    \"duration\": \"{$duration}\",
    \"studyHours\": \"{$study_hours}\",
    \"targetStudents\": \"{$target_students}\",
    \"learning_objectives\": [\"...\"],
    \"modules\": [
      {
        \"title\": \"Module 1: ...\",
        \"description\": \"...\",
        \"estimatedDuration\": \"...\",
        \"learning_objectives\": [\"...\"],
        \"topics\": [
          {
            \"title\": \"...\",
            \"description\": \"...\",
            \"learning_objectives\": [\"...\"],
            \"keyConcepts\": [\"...\"],
            \"estimatedStudyTime\": \"...\",
            \"syntax\": \"...\",
            \"example\": \"...\",
            \"output\": \"...\",
            \"practiceActivity\": \"...\"
          }
        ],
        \"quiz\": {
          \"title\": \"...\",
          \"difficulty\": \"{$difficulty}\",
          \"questions\": [
            {
              \"question\": \"...\",
              \"options\": [\"A\", \"B\", \"C\", \"D\"],
              \"correct_answer\": \"A\",
              \"explanation\": \"...\",
              \"difficulty\": \"{$difficulty}\",
              \"related_topic\": \"...\"
            }
          ]
        }
      }
    ],
    \"finalAssessment\": {
      \"title\": \"Final Assessment\",
      \"total_questions\": 10,
      \"questions\": [...]
    }
  }
}";

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $gemini_api_key;
    $post_data = [
        "contents" => [
            ["parts" => [["text" => $prompt]]]
        ],
        "generationConfig" => [
            "responseMimeType" => "application/json"
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code === 200 && $response) {
        $res_json = json_decode($response, true);
        $raw_text = $res_json['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $parsed = json_decode($raw_text, true);
        if (is_array($parsed) && isset($parsed['course'])) {
            $generated_course = $parsed;
        }
    }
}

if ($generated_course !== null) {
    echo json_encode($generated_course);
    exit();
}

// If no external LLM response, signal client to use fallback synthesizer
http_response_code(200);
echo json_encode(["status" => "fallback_to_client_synthesizer"]);
