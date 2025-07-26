🚀 Submitting course to database... {isDraft: false}isDraft: false[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
admin-scripts.js:84 ❌ Error creating course: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLFormElement.<anonymous> (admin-scripts.js:483:17)
overrideMethod @ hook.js:608
createCourse @ admin-scripts.js:84
await in createCourse
submitCourseToDatabase @ admin-scripts.js:247
handleCourseFormSubmission @ admin-scripts.js:340
(anonymous) @ admin-scripts.js:483
(anonymous) @ admin-dashboard.html:4296
admin-scripts.js:253 ❌ Error submitting course: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLFormElement.<anonymous> (admin-scripts.js:483:17)
overrideMethod @ hook.js:608
submitCourseToDatabase @ admin-scripts.js:253
await in submitCourseToDatabase
handleCourseFormSubmission @ admin-scripts.js:340
(anonymous) @ admin-scripts.js:483
(anonymous) @ admin-dashboard.html:4296
admin-scripts.js:357 ❌ Course submission failed: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLFormElement.<anonymous> (admin-scripts.js:483:17)
overrideMethod @ hook.js:608
handleCourseFormSubmission @ admin-scripts.js:357
await in handleCourseFormSubmission
(anonymous) @ admin-scripts.js:483
(anonymous) @ admin-dashboard.html:4296
admin-dashboard.html:4268 Error creating course: {code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "courses"'}code: "42501"details: nullhint: nullmessage: "new row violates row-level security policy for table \"courses\""[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
overrideMethod @ hook.js:608
(anonymous) @ admin-dashboard.html:4268
await in (anonymous)
(anonymous) @ admin-dashboard.html:4296
admin-scripts.js:84 ❌ Error creating course: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLButtonElement.<anonymous> (admin-scripts.js:465:17)
overrideMethod @ hook.js:608
createCourse @ admin-scripts.js:84
await in createCourse
submitCourseToDatabase @ admin-scripts.js:247
handleCourseFormSubmission @ admin-scripts.js:340
(anonymous) @ admin-scripts.js:465
admin-scripts.js:253 ❌ Error submitting course: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLButtonElement.<anonymous> (admin-scripts.js:465:17)
overrideMethod @ hook.js:608
submitCourseToDatabase @ admin-scripts.js:253
await in submitCourseToDatabase
handleCourseFormSubmission @ admin-scripts.js:340
(anonymous) @ admin-scripts.js:465
admin-scripts.js:357 ❌ Course submission failed: Error: Could not find the 'status' column of 'courses' in the schema cache
    at Object.createCourse (admin-scripts.js:79:35)
    at async submitCourseToDatabase (admin-scripts.js:247:31)
    at async handleCourseFormSubmission (admin-scripts.js:340:31)
    at async HTMLButtonElement.<anonymous> (admin-scripts.js:465:17)
overrideMethod @ hook.js:608
handleCourseFormSubmission @ admin-scripts.js:357
await in handleCourseFormSubmission
(anonymous) @ admin-scripts.js:465