const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

const newScript = "          <script>\n" +
"            (function() {\n" +
"              let reportSent = false;\n" +
"              const checkResults = (force = false) => {\n" +
"                 if (reportSent) return;\n" +
"                 \n" +
"                 const pageText = document.body.innerText || '';\n" +
"                 const pageTextLower = pageText.toLowerCase();\n" +
"                 const gateway = document.getElementById('result-gateway') || \n" +
"                                 document.querySelector('.result-panel, .score-card, #score-card, #result, .result, #score, .score');\n" +
"                                 \n" +
"                 // Broaden result page detection\n" +
"                 const isResultPage = force || \n" +
"                                      (gateway && !gateway.classList.contains('hidden')) || \n" +
"                                      pageTextLower.includes('total score') || \n" +
"                                      pageTextLower.includes('test summary') ||\n" +
"                                      pageTextLower.includes('test result') ||\n" +
"                                      pageTextLower.includes('marks obtained') ||\n" +
"                                      (pageTextLower.includes('correct') && pageTextLower.includes('wrong') && pageTextLower.includes('score'));\n" +
"                                      \n" +
"                 if (isResultPage) {\n" +
"                     reportSent = true;\n" +
"                     \n" +
"                     // 1. Try standard NTA clone IDs first\n" +
"                     let score = document.getElementById('gt-score')?.innerText || document.getElementById('score')?.innerText || document.getElementById('lblScore')?.innerText;\n" +
"                     let correct = document.getElementById('gt-correct')?.innerText || document.getElementById('correct-ans')?.innerText || document.getElementById('correct')?.innerText || document.getElementById('lblCorrect')?.innerText;\n" +
"                     let wrong = document.getElementById('gt-wrong')?.innerText || document.getElementById('incorrect-ans')?.innerText || document.getElementById('wrong')?.innerText || document.getElementById('lblWrong')?.innerText;\n" +
"                     let attempt = document.getElementById('gt-attempt')?.innerText || document.getElementById('attempted-ques')?.innerText || document.getElementById('attempted')?.innerText || document.getElementById('lblAttempted')?.innerText;\n" +
"                     let time = document.getElementById('gt-time')?.innerText || document.getElementById('time-taken')?.innerText;\n" +
"                     let accuracy = document.getElementById('gt-accuracy')?.innerText || document.getElementById('accuracy')?.innerText || document.getElementById('lblAccuracy')?.innerText;\n" +
"                     \n" +
"                     // 2. Fallback to Regex parsing if IDs are missing\n" +
"                     function extractNumberNear(keyword) {\n" +
"                         const regex = new RegExp(keyword + '\\\\s*[:\\\\-=\\\\n]*\\\\s*([\\\\d\\\\.]+)', 'i');\n" +
"                         const match = pageText.match(regex);\n" +
"                         return match ? match[1] : null;\n" +
"                     }\n" +
"                     \n" +
"                     if (!score) score = extractNumberNear('(?:Score|Marks|Total Score|Marks Obtained|Total Marks)');\n" +
"                     if (!correct) correct = extractNumberNear('(?:Correct|Correct Answers?|Right)');\n" +
"                     if (!wrong) wrong = extractNumberNear('(?:Wrong|Incorrect|Incorrect Answers?)');\n" +
"                     if (!attempt) attempt = extractNumberNear('(?:Attempted|Attempted Questions?|Answered)');\n" +
"                     if (!time) {\n" +
"                         const m = pageText.match(/(?:Time|Time Taken)\\s*[:\\-]?\\s*([\\d\\w\\s:]+)/i);\n" +
"                         time = m ? m[1].trim() : '0s';\n" +
"                     }\n" +
"                     \n" +
"                     // Calculate accuracy if missing\n" +
"                     if (!accuracy) {\n" +
"                         const m = pageText.match(/Accuracy\\s*[:\\-]?\\s*(\\d+\\.?\\d*)/i);\n" +
"                         if (m) {\n" +
"                             accuracy = m[1] + '%';\n" +
"                         } else {\n" +
"                             const c = parseInt(correct || '0');\n" +
"                             const a = parseInt(attempt || '0');\n" +
"                             accuracy = (a > 0) ? ((c / a) * 100).toFixed(1) + '%' : '0%';\n" +
"                         }\n" +
"                     }\n" +
"                     \n" +
"                     window.parent.postMessage({\n" +
"                         type: 'CBT_SUBMIT',\n" +
"                         payload: { testId: '${test.id}', score: score || '0', correct: correct || '0', wrong: wrong || '0', accuracy: accuracy || '0%', attempt: attempt || '0', time }\n" +
"                     }, '*');\n" +
"                 }\n" +
"              };\n" +
"              \n" +
"              window.addEventListener('message', (event) => {\n" +
"                  if (event.data?.type === 'FORCE_CAPTURE') {\n" +
"                      reportSent = false;\n" +
"                      checkResults(true);\n" +
"                  }\n" +
"              });\n" +
"              \n" +
"              const observer = new MutationObserver(() => checkResults(false));\n" +
"              window.addEventListener('DOMContentLoaded', () => {\n" +
"                  observer.observe(document.body, { attributes: true, childList: true, subtree: true });\n" +
"                  setInterval(() => checkResults(false), 1000);\n" +
"              });\n" +
"            })();\n" +
"          </script>";

const startIndex = c.indexOf('<script>\n            (function() {\n              let reportSent = false;');
if (startIndex !== -1) {
    const endIndex = c.indexOf('</script>', startIndex) + 9;
    c = c.substring(0, startIndex) + newScript + c.substring(endIndex);
    fs.writeFileSync('src/pages/CBTViewer.tsx', c);
    console.log('Fixed CBTViewer script');
} else {
    console.log('Could not find the script in CBTViewer.tsx');
}
