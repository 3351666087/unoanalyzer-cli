# UnoAnalyzer API — discovered endpoint catalogue

> Snapshot from platform build `COpd18M4` on 2026-09-20T09:34:21.872Z. 318 endpoints.
> Regenerate the live version any time with: `uno sync && uno endpoints --json`.

Legend: **[C]** curated & verified · plain = auto-discovered (best-effort). Request-body fields, when known, are shown in {braces}.

## AdminCoursesPage

- `GET /api/admin/institution/:institutionId/courses`  `id: get_admin_institution_institutionid_courses`

## AdminSettingsPage

- `PATCH /api/institutions/:institutionId`  body {name, country, domain}  `id: patch_institutions_institutionid`
- `POST /api/institutions/:institutionId/subaccounts`  body {email, role}  `id: post_institutions_institutionid_subaccounts`

## AdminSignupAllowlistPage

- `GET /api/admin/signup-allowlist`  `id: get_admin_signup_allowlist`
- `DELETE /api/admin/signup-allowlist/domains`  `id: delete_admin_signup_allowlist_domains`
- `DELETE /api/admin/signup-allowlist/faculty-emails`  `id: delete_admin_signup_allowlist_faculty_emails`
- `GET /api/cn/admin/backup/history`  `id: get_admin_backup_history`
- `GET /api/cn/admin/backup/postgres`  `id: get_admin_backup_postgres`
- `GET /api/cn/admin/backup/storage`  `id: get_admin_backup_storage`
- `GET /api/cn/admin/signup-allowlist`  `id: get_admin_signup_allowlist_2`
- `DELETE /api/cn/admin/signup-allowlist/domains`  `id: delete_admin_signup_allowlist_domains_2`
- `DELETE /api/cn/admin/signup-allowlist/faculty-emails`  `id: delete_admin_signup_allowlist_faculty_emails_2`

## AmbassadorsPage

- `POST /api/ambassadors/apply`  `id: post_ambassadors_apply`

## AssessmentEvaluationsPage

- `GET /api/cn/batches/:batcheId`  `id: get_batches_batcheid_2`
- `GET /api/cn/courses/:courseId/assessments/:assessmentId/batch-evaluate`  `id: get_courses_courseid_assessments_assessmentid_batch_evaluate`
- `GET /api/cn/courses/:courseId/batches`  `id: get_courses_courseid_batches`
- `GET /api/courses/:courseId/assessments/:assessmentId/batch-evaluate`  `id: get_courses_courseid_assessments_assessmentid_batch_evaluate_2`
- `GET /api/courses/:courseId/eval-batches`  `id: get_courses_courseid_eval_batches`
- `POST /api/courses/:courseId/materials`  `id: post_courses_courseid_materials`
- `GET /api/eval-batches/:evalBatcheId`  `id: get_eval_batches_evalbatcheid`

## CapabilitySynthesisPage

- `POST /api/cn/student/:studentId/capability-synthesis/generate`  `id: post_student_studentid_capability_synthesis_generate`

## CompetitionsDiscoverPage

- `GET /api/cn/competitions/:competitionId/teams`  `id: get_competitions_competitionid_teams`
- `POST /api/cn/competitions/:competitionId/teams`  body {name, looking_for_skills}  `id: post_competitions_competitionid_teams`
- `POST /api/cn/competitions/:competitionId/teams/:teamId/apply`  body {note}  `id: post_competitions_competitionid_teams_teamid_apply`

## CourseAlignmentPage-DFsJ_C

- `GET /api/courses/:courseId/materials/:materialId/url`  `id: get_courses_courseid_materials_materialid_url_2`

## CourseDetailPage

- `GET /api/cn/courses/:courseId/activity-summary`  `id: get_courses_courseid_activity_summary`
- `GET /api/cn/courses/:courseId/ai-usage`  `id: get_courses_courseid_ai_usage`

## CourseSchedulingPage

- `POST /api/cn/courses/:courseId/staff-schedule-lock`  body {locked}  `id: post_courses_courseid_staff_schedule_lock`

## DashboardPage

- `GET /api/cn/student/:studentId/briefing`  `id: get_student_studentid_briefing`
- `GET /api/users/me/onboarding`  `id: get_users_me_onboarding`

## DraftProgressionPage

- `GET /api/student/:studentId/assessments/:assessmentId/feedback-absorption`  `id: get_student_studentid_assessments_assessmentid_feedback_absorption`

## English

- `GET /api/cn/to-english`  `id: get_to_english`

## FacultyApplyModal-XP0jb7

- `POST /api/v1/faculty-application`  `id: post_faculty_application`

## GroupsPage

- `GET /api/students`  `id: get_students`

## HandbookBriefPage

- `GET /api/courses/:courseId`  `id: get_courses_courseid_2`

## ImportPortfolioPage

- `GET /api/import/portfolio`  `id: get_import_portfolio`
- `GET /api/import/portfolio/confirm`  `id: get_import_portfolio_confirm`
- `GET /api/import/portfolio/status`  `id: get_import_portfolio_status`

## InterRaterPage

- `GET /api/assessments/:assessmentId/:arg2`  `id: get_assessments_assessmentid_arg2`

## LandingPage

- `GET /api/contact`  `id: get_contact`
- `GET /api/interest`  `id: get_interest`

## LearningAnalyticsPage

- `GET /api/courses/:courseId/lo-attainment`  `id: get_courses_courseid_lo_attainment_2`
- `GET /api/learning-analytics/calibration`  `id: get_learning_analytics_calibration`
- `GET /api/learning-analytics/lo-attainment`  `id: get_learning_analytics_lo_attainment`
- `GET /api/rubrics/:rubricId/coverage`  `id: get_rubrics_rubricid_coverage`

## ReportViewer

- `POST /api/submissions/:submissionId/reevaluate`  `id: post_submissions_submissionid_reevaluate_2`

## ResearchPage

- `GET /api/cn/courses/:courseId/grade-distribution`  `id: get_courses_courseid_grade_distribution`
- `GET /api/cn/courses/:courseId/lo-attainment`  `id: get_courses_courseid_lo_attainment`
- `GET /api/cn/courses/:courseId/reader-consistency`  `id: get_courses_courseid_reader_consistency`
- `GET /api/cn/research/overview`  `id: get_research_overview`
- `GET /api/cn/research/summary`  `id: get_research_summary`
- `GET /api/faculty/:facultyId/research/benchmark-export`  `id: get_faculty_facultyid_research_benchmark_export`
- `GET /api/faculty/:facultyId/research/cohort-trends`  `id: get_faculty_facultyid_research_cohort_trends`
- `GET /api/faculty/:facultyId/research/partner-impact`  `id: get_faculty_facultyid_research_partner_impact`
- `GET /api/faculty/:facultyId/research/summary`  `id: get_faculty_facultyid_research_summary`
- `GET /api/faculty/:facultyId/research/voice`  `id: get_faculty_facultyid_research_voice`

## SettingsPage

- `GET /api/auth/2fa`  `id: get_auth_2fa`
- `GET /api/cn/users/:userId`  `id: get_users_userid_2`
- `PATCH /api/cn/users/:userId`  body {keep_profile_private, profile_visible_sections}  `id: patch_users_userid`

## StaffQuestionsCard

- `GET /api/cn/courses/:courseId/surveys`  `id: get_courses_courseid_surveys`
- `POST /api/cn/courses/:courseId/surveys`  `id: post_courses_courseid_surveys`
- `POST /api/cn/courses/:courseId/surveys/:surveyId/close`  `id: post_courses_courseid_surveys_surveyid_close`
- `GET /api/cn/courses/:courseId/surveys/:surveyId/results`  `id: get_courses_courseid_surveys_surveyid_results`

## StoriesPage

- `GET /api/faculty/:facultyId/course-stories`  `id: get_faculty_facultyid_course_stories`
- `POST /api/faculty/:facultyId/course-stories/:courseStorieId/generate`  `id: post_faculty_facultyid_course_stories_coursestorieid_generate`
- `GET /api/faculty/:facultyId/stories`  `id: get_faculty_facultyid_stories`
- `POST /api/faculty/:facultyId/stories/:storieId/:arg3/generate`  `id: post_faculty_facultyid_stories_storieid_arg3_generate`
- `GET /api/faculty/:facultyId/team-stories`  `id: get_faculty_facultyid_team_stories`
- `POST /api/faculty/:facultyId/team-stories/:teamStorieId/:arg3/generate`  `id: post_faculty_facultyid_team_stories_teamstorieid_arg3_generate`

## SyllabusImportModal

- `GET /api/courses/extract-syllabus`  `id: get_courses_extract_syllabus_2`

## admin-CZs8Lp

- `GET /api/admin/full-script`  `id: get_admin_full_script`
- `GET /api/admin/institutions`  `id: get_admin_institutions`
- `POST /api/admin/institutions/:institutionId/subaccounts`  body {caller_uid}  `id: post_admin_institutions_institutionid_subaccounts`
- `GET /api/admin/prompts`  `id: get_admin_prompts`
- `PUT /api/admin/prompts/:promptId`  body {caller_uid}  `id: put_admin_prompts_promptid`
- `GET /api/admin/users`  `id: get_admin_users`
- `DELETE /api/admin/users/:userId`  `id: delete_admin_users_userid`

## ai

- `GET /api/references/validate`  `id: get_references_validate`
- `GET /api/winston/ai-detection`  `id: get_winston_ai_detection`
- `GET /api/winston/plagiarism`  `id: get_winston_plagiarism`

## assistant

- **[C]** `POST /api/cn/student/:studentUid/course/:courseId/chat` — Ask the course assistant. Body: { message, mode?(assistant|socratic), history? }; reply in .response.  body {message, mode, history}  `id: chat.send`
- **[C]** `GET /api/cn/student/:studentUid/course/:courseId/chat/history` — Course assistant chat history.  `id: chat.history`

## batches

- `GET /api/batches`  `id: get_batches`
- `GET /api/batches/:batcheId`  `id: get_batches_batcheid`
- `POST /api/batches/:batcheId/cancel`  `id: post_batches_batcheid_cancel`
- `GET /api/batches/:batcheId/outputs/:outputId/url`  `id: get_batches_batcheid_outputs_outputid_url`
- `GET /api/batches/:batcheId/submissions`  `id: get_batches_batcheid_submissions`

## briefing

- **[C]** `GET /api/cn/student/:studentUid/briefing` — Weekly AI briefings across my courses.  `id: briefing.get`

## capabilities

- **[C]** `GET /api/cn/public/profile/:uid` — Public verified profile for a user.  `id: profile.public`
- `GET /api/cn/student/:studentId/:arg2`  `id: get_student_studentid_arg2_2`
- `GET /api/cn/student/:studentId/capability/:capabilityId/evidence`  `id: get_student_studentid_capability_capabilityid_evidence`
- `GET /api/cn/student/:studentId/narrative`  `id: get_student_studentid_narrative`
- `POST /api/cn/student/:studentId/narrative/approve`  `id: post_student_studentid_narrative_approve`
- `POST /api/cn/student/:studentId/narrative/generate`  `id: post_student_studentid_narrative_generate`
- **[C]** `GET /api/cn/student/:studentUid/capabilities` — Demonstrated capabilities with levels and evidence counts.  `id: capabilities.list`
- **[C]** `GET /api/cn/student/:studentUid/capability/:subCapId/evidence` — Evidence backing one sub-capability.  `id: capability.evidence`
- **[C]** `GET /api/cn/student/:studentUid/narrative` — My capability narrative (text + status).  `id: narrative.get`
- **[C]** `POST /api/cn/student/:studentUid/narrative/approve` — Approve/publish the generated narrative.  `id: narrative.approve`
- **[C]** `POST /api/cn/student/:studentUid/narrative/generate` — Generate a capability narrative.  `id: narrative.generate`
- `GET /api/student/:studentId/:arg2`  `id: get_student_studentid_arg2`
- `GET /api/v1/records`  `id: get_records_2`

## core

- `POST /api/auth/resend-otp`  `id: post_auth_resend_otp`
- `GET /api/auth/verify-otp`  `id: get_auth_verify_otp`
- `GET /api/cn/auth/accept-terms`  `id: get_auth_accept_terms`
- `GET /api/cn/auth/research-consent`  `id: get_auth_research_consent`
- `GET /api/cn/auth/terms-status`  `id: get_auth_terms_status`
- `GET /api/cn/me/change-password`  `id: get_me_change_password`
- `GET /api/cn/me/heartbeat`  `id: get_me_heartbeat`
- `GET /api/cn/users/me`  `id: get_users_me`
- `GET /api/early_access_features/`  `id: get_early_access_features`
- `GET /api/partner/:partnerId/messages`  `id: get_partner_partnerid_messages`
- `POST /api/partner/:partnerId/messages/:messageId`  body {body, senderName}  `id: post_partner_partnerid_messages_messageid`
- `GET /api/partner/:partnerId/notifications`  `id: get_partner_partnerid_notifications`
- `POST /api/partner/:partnerId/notifications/:notificationId/read`  `id: post_partner_partnerid_notifications_notificationid_read`
- `POST /api/partner/:partnerId/notifications/read-all`  `id: post_partner_partnerid_notifications_read_all`
- `GET /api/partner/:partnerId/partnerships`  `id: get_partner_partnerid_partnerships`
- `GET /api/partner/:partnerId/profile`  `id: get_partner_partnerid_profile`
- `POST /api/partner/:partnerId/profile`  `id: post_partner_partnerid_profile`
- `GET /api/partner/:partnerId/students`  `id: get_partner_partnerid_students`
- `GET /api/product_tours/`  `id: get_product_tours`
- `GET /api/student/:studentId/join-requests`  `id: get_student_studentid_join_requests`
- `GET /api/surveys/`  `id: get_surveys`
- `GET /api/users/:userId`  `id: get_users_userid`
- `GET /api/web_experiments/`  `id: get_web_experiments`

## courseIntelligence

- `GET /api/cn/student/:studentId/course/:courseId/chat`  `id: get_student_studentid_course_courseid_chat`
- `GET /api/cn/student/:studentId/course/:courseId/chat/history`  `id: get_student_studentid_course_courseid_chat_history`
- `GET /api/faculty/:facultyId/course/:courseId/engagement-signals`  `id: get_faculty_facultyid_course_courseid_engagement_signals`
- `POST /api/faculty/:facultyId/nudge-student`  body {student_id, course_id, message}  `id: post_faculty_facultyid_nudge_student`
- `GET /api/student/:studentId/course/:courseId/chat`  `id: get_student_studentid_course_courseid_chat_2`
- `GET /api/student/:studentId/course/:courseId/chat/history`  `id: get_student_studentid_course_courseid_chat_history_2`

## courses

- `GET /api/activity`  `id: get_activity`
- `POST /api/assessments/:assessmentId/human-grades`  `id: post_assessments_assessmentid_human_grades`
- `GET /api/cn/courses`  `id: get_courses_2`
- `PATCH /api/cn/courses/:courseId`  body {name, code, term, description, totalWeeks, startDate, skipWeeks}  `id: patch_courses_courseid`
- **[C]** `GET /api/cn/courses/:courseId` — Full course detail: assessments, milestones, sessions, materials, weights.  `id: course.detail`
- **[C]** `GET /api/cn/courses/:courseId/handbook` — Course handbook brief.  `id: course.handbook`
- **[C]** `GET /api/cn/courses/:courseId/messages` — Course broadcast messages.  `id: course.messages`
- **[C]** `GET /api/cn/courses/:courseId/my-brief` — The mentor brief addressed to me/my group.  `id: course.myBrief`
- **[C]** `GET /api/cn/courses/:courseId/my-mentor` — My assigned mentor and their office hours.  `id: course.myMentor`
- **[C]** `GET /api/cn/courses/:courseId/proof-activity` — Recent evidence/proof activity across the course.  `id: course.proofActivity`
- `GET /api/cn/courses/:courseId/roster`  `id: get_courses_courseid_roster`
- **[C]** `POST /api/cn/courses/:courseId/surveys/:surveyId/responses` — Submit a response to an open survey.  body {answers}  `id: course.surveyRespond`
- **[C]** `GET /api/cn/courses/:courseId/surveys/open` — Currently open staff surveys.  `id: course.surveysOpen`
- **[C]** `GET /api/cn/courses/:courseId/verification-layers` — Enabled and available evidence verification layers.  `id: course.verificationLayers`
- `PUT /api/cn/courses/:courseId/verification-layers`  body {layers}  `id: put_courses_courseid_verification_layers`
- **[C]** `GET /api/cn/courses/code/:code/preview` — Preview a course from its join code before joining.  `id: course.previewCode`
- **[C]** `POST /api/cn/courses/join` — Join a course. Body: { course_code }.  body {course_code}  `id: course.join`
- `GET /api/cn/student/:studentId/courses`  `id: get_student_studentid_courses`
- **[C]** `GET /api/cn/student/:studentUid/courses` — Courses I have joined (with nested assessments).  `id: courses.list`
- `GET /api/cn/upload/material`  `id: get_upload_material`
- `GET /api/courses`  `id: get_courses`
- `DELETE /api/courses/:courseId`  `id: delete_courses_courseid`
- `PATCH /api/courses/:courseId`  `id: patch_courses_courseid_2`
- `GET /api/courses/:courseId/:arg2`  `id: get_courses_courseid_arg2`
- `GET /api/courses/:courseId/assessments`  `id: get_courses_courseid_assessments`
- `POST /api/courses/:courseId/assessments`  `id: post_courses_courseid_assessments`
- `PATCH /api/courses/:courseId/assessments/:assessmentId`  `id: patch_courses_courseid_assessments_assessmentid`
- `DELETE /api/courses/:courseId/assessments/:assessmentId`  `id: delete_courses_courseid_assessments_assessmentid`
- `POST /api/courses/:courseId/assessments/:assessmentId/:arg3`  `id: post_courses_courseid_assessments_assessmentid_arg3`
- `POST /api/courses/:courseId/find-readings`  body {topic, count, types}  `id: post_courses_courseid_find_readings`
- `GET /api/courses/:courseId/learning-outcomes`  `id: get_courses_courseid_learning_outcomes`
- `GET /api/courses/:courseId/quality`  `id: get_courses_courseid_quality`
- `POST /api/courses/:courseId/sessions`  `id: post_courses_courseid_sessions`
- `PATCH /api/courses/:courseId/sessions/:sessionId`  `id: patch_courses_courseid_sessions_sessionid`
- `DELETE /api/courses/:courseId/sessions/:sessionId`  `id: delete_courses_courseid_sessions_sessionid`
- `GET /api/courses/:courseId/students`  `id: get_courses_courseid_students`
- `GET /api/courses/suggest-schedule`  `id: get_courses_suggest_schedule`
- `GET /api/demo-day`  `id: get_demo_day`
- `GET /api/institution`  `id: get_institution`
- `GET /api/student/:studentId/courses`  `id: get_student_studentid_courses_2`

## documents

- `GET /api/documents/extract`  `id: get_documents_extract`
- `GET /api/submissions`  `id: get_submissions_2`

## drafts

- `POST /api/assessments/:assessmentId/drafts`  `id: post_assessments_assessmentid_drafts`
- `GET /api/assessments/:assessmentId/drafts`  `id: get_assessments_assessmentid_drafts`
- `GET /api/cn/drafts/submit`  `id: get_drafts_submit`
- `GET /api/cn/student/:studentId/assessments/:assessmentId/drafts`  `id: get_student_studentid_assessments_assessmentid_drafts`
- `GET /api/student/:studentId/assessments/:assessmentId/draft-progression`  `id: get_student_studentid_assessments_assessmentid_draft_progression`
- `GET /api/student/:studentId/assessments/:assessmentId/drafts`  `id: get_student_studentid_assessments_assessmentid_drafts_2`

## facultyIntelligence

- `POST /api/faculty/:facultyId/cpd/generate-statement`  body {from_date, to_date}  `id: post_faculty_facultyid_cpd_generate_statement`
- `POST /api/faculty/:facultyId/live-projects`  `id: post_faculty_facultyid_live_projects`
- `GET /api/faculty/:facultyId/live-projects`  `id: get_faculty_facultyid_live_projects`
- `GET /api/faculty/:facultyId/live-projects/:liveProjectId/progress`  `id: get_faculty_facultyid_live_projects_liveprojectid_progress`
- `POST /api/faculty/:facultyId/live-projects/:liveProjectId/progress-report`  `id: post_faculty_facultyid_live_projects_liveprojectid_progress_report`
- `POST /api/faculty/:facultyId/translate-brief`  body {brief_text, course_id}  `id: post_faculty_facultyid_translate_brief`

## groups

- **[C]** `GET /api/cn/courses/:courseId/groups` — All groups in a course (find mine by memberUids).  `id: groups.list`
- **[C]** `POST /api/cn/courses/:courseId/groups` — Create a group in a course.  `id: group.create`
- **[C]** `DELETE /api/cn/courses/:courseId/groups/:groupId` — Delete a group.  `id: group.delete`
- **[C]** `GET /api/cn/groups/:groupId/activity` — Group activity feed (proofs, tasks, milestones).  `id: group.activity`
- **[C]** `POST /api/cn/groups/:groupId/contribution-read` — Mark contribution activity as read.  `id: group.contributionRead`
- **[C]** `POST /api/cn/groups/:groupId/files` — Upload a file to the group (multipart 'file').  `id: group.fileUpload`
- **[C]** `DELETE /api/cn/groups/:groupId/files/:fileId` — Delete a group file.  `id: group.fileRemove`
- **[C]** `POST /api/cn/groups/:groupId/invite` — Invite a member to the group. Body: { email }.  body {email}  `id: group.invite`
- **[C]** `PUT /api/cn/groups/:groupId/leader` — Set the group leader.  `id: group.setLeader`
- **[C]** `POST /api/cn/groups/:groupId/leave` — Leave a group.  `id: group.leave`
- **[C]** `GET /api/cn/groups/:groupId/milestone-completions` — Milestone completion state for a group.  `id: group.milestoneCompletions`
- **[C]** `POST /api/cn/groups/:groupId/milestone-completions/:milestoneId/toggle` — Toggle a milestone's completion.  `id: group.toggleMilestone`
- **[C]** `PATCH /api/cn/groups/:groupId/name` — Rename a group. Body: { name }.  body {name}  `id: group.rename`
- **[C]** `PUT /api/cn/groups/:groupId/project` — Set/choose the group's project.  `id: group.setProject`
- **[C]** `GET /api/cn/groups/:groupId/student-activity` — Per-student contribution activity in a group.  `id: group.studentActivity`
- **[C]** `POST /api/cn/groups/:groupId/tasks` — Add a task. Body: { title, internal_deadline? }.  body {title, internal_deadline}  `id: group.taskAdd`
- **[C]** `DELETE /api/cn/groups/:groupId/tasks/:taskId` — Remove a task.  `id: group.taskRemove`
- `GET /api/courses/:courseId/groups/mine`  `id: get_courses_courseid_groups_mine`

## identity

- **[C]** `GET /api/cn/me` — Current authenticated user profile.  `id: me.get`
- **[C]** `POST /api/cn/me/heartbeat` — Presence heartbeat.  `id: me.heartbeat`
- **[C]** `GET /api/cn/me/nudges` — Nudges addressed to me.  `id: me.nudges`
- **[C]** `GET /api/cn/me/onboarding` — Onboarding completion state.  `id: me.onboarding`
- **[C]** `POST /api/cn/nudges/:nudgeId/seen` — Mark a nudge as seen.  `id: me.nudgeSeen`
- **[C]** `GET /api/cn/student/me/tier` — Account tier and linked courses/institution.  `id: me.tier`

## invites

- `POST /api/cn/courses/:courseId/code`  `id: post_courses_courseid_code`
- `GET /api/cn/courses/:courseId/sections/:sectionId/course-code`  `id: get_courses_courseid_sections_sectionid_course_code`
- `POST /api/cn/groups/:groupId/invite-link`  `id: post_groups_groupid_invite_link`
- `POST /api/cn/groups/join/:joinId`  body {student_id, student_name, course_id}  `id: post_groups_join_joinid`
- `GET /api/courses/:courseId/course-code`  `id: get_courses_courseid_course_code`
- `GET /api/courses/:courseId/sections/:sectionId/course-code`  `id: get_courses_courseid_sections_sectionid_course_code_2`
- `GET /api/courses/:courseId/student-invites`  `id: get_courses_courseid_student_invites`
- `POST /api/courses/:courseId/student-invites/:studentInviteId/resend`  `id: post_courses_courseid_student_invites_studentinviteid_resend`
- `POST /api/faculty/:facultyId/invite-partner`  body {partner_email}  `id: post_faculty_facultyid_invite_partner`
- `GET /api/faculty/:facultyId/invites`  `id: get_faculty_facultyid_invites`
- `POST /api/student-invites/:studentInviteId/accept`  `id: post_student_invites_studentinviteid_accept`
- `GET /api/student-invites/pending`  `id: get_student_invites_pending`

## mentor

- `GET /api/cn/courses/:courseId/:arg2`  `id: get_courses_courseid_arg2_2`
- `POST /api/cn/courses/:courseId/mentor-briefs/send`  `id: post_courses_courseid_mentor_briefs_send`
- `GET /api/cn/courses/:courseId/mentor-questions`  `id: get_courses_courseid_mentor_questions`
- `GET /api/cn/courses/:courseId/message-history`  `id: get_courses_courseid_message_history`
- `GET /api/cn/courses/:courseId/my-questions`  `id: get_courses_courseid_my_questions`
- `GET /api/cn/courses/:courseId/proposals/pending`  `id: get_courses_courseid_proposals_pending`
- `PUT /api/cn/courses/:courseId/staff/:staffId/office-hours`  body {office_hours}  `id: put_courses_courseid_staff_staffid_office_hours`
- `PATCH /api/cn/groups/:groupId/assignments`  `id: patch_groups_groupid_assignments`
- `GET /api/cn/groups/:groupId/mentor-questions`  `id: get_groups_groupid_mentor_questions`
- `POST /api/cn/groups/:groupId/mentor-questions`  body {text}  `id: post_groups_groupid_mentor_questions`
- `PATCH /api/cn/groups/:groupId/placement`  body {session_id, number}  `id: patch_groups_groupid_placement`
- `POST /api/cn/mentor-questions/:mentorQuestionId/answers`  body {text}  `id: post_mentor_questions_mentorquestionid_answers`
- `PATCH /api/groups/:groupId/placement`  body {sessionId, number}  `id: patch_groups_groupid_placement_2`
- `PATCH /api/groups/:groupId/staff-assignment`  body {taUid, mentorUid}  `id: patch_groups_groupid_staff_assignment`
- `GET /api/mentor-invites`  `id: get_mentor_invites`
- `POST /api/mentor-invites/:mentorInviteId/revoke`  `id: post_mentor_invites_mentorinviteid_revoke`
- `GET /api/mentor-invites/by-token/:byTokenId`  `id: get_mentor_invites_by_token_bytokenid`
- `GET /api/mentor-invites/claim`  `id: get_mentor_invites_claim`

## misc

- **[C]** `POST /api/cn/to-english` — Translate to English. Body: { items: [{ key, text }] }; result in .english.  body {items}  `id: toEnglish`

## moderation

- `GET /api/moderation`  `id: get_moderation`
- `GET /api/submissions/:submissionId`  `id: get_submissions_submissionid_2`
- `POST /api/submissions/:submissionId/claim`  `id: post_submissions_submissionid_claim`
- `POST /api/submissions/:submissionId/moderate`  `id: post_submissions_submissionid_moderate`

## professorProjects

- `GET /api/professor/:professorId/projects`  `id: get_professor_professorid_projects`
- `POST /api/professor/:professorId/projects`  `id: post_professor_professorid_projects`
- `GET /api/professor/:professorId/projects/:projectId`  `id: get_professor_professorid_projects_projectid`
- `PUT /api/professor/:professorId/projects/:projectId`  `id: put_professor_professorid_projects_projectid`
- `DELETE /api/professor/:professorId/projects/:projectId`  `id: delete_professor_professorid_projects_projectid`
- `GET /api/professor/extract-brief`  `id: get_professor_extract_brief`

## projects

- `GET /api/:apiId`  `id: get_apiid`
- `GET /api/cn/projects/:projectId/groups`  `id: get_projects_projectid_groups`
- `GET /api/cn/projects/:projectId/questions`  `id: get_projects_projectid_questions`
- `POST /api/cn/projects/:projectId/questions`  body {text}  `id: post_projects_projectid_questions`
- `POST /api/cn/projects/:projectId/questions/:questionId/answers`  body {text}  `id: post_projects_projectid_questions_questionid_answers`
- `GET /api/cn/projects/partner-accounts`  `id: get_projects_partner_accounts`
- `PATCH /api/partners/:partnerId/status`  body {status, vettedBy, caller_uid}  `id: patch_partners_partnerid_status`
- `GET /api/projects`  `id: get_projects`
- `GET /api/projects/:projectId`  `id: get_projects_projectid`
- `PATCH /api/projects/:projectId`  `id: patch_projects_projectid`
- `GET /api/projects/:projectId/milestones`  `id: get_projects_projectid_milestones`
- `GET /api/projects/:projectId/nda-url`  `id: get_projects_projectid_nda_url`
- `GET /api/projects/:projectId/submissions`  `id: get_projects_projectid_submissions`
- `GET /api/projects/:projectId/teams`  `id: get_projects_projectid_teams`
- `POST /api/projects/:projectId/teams`  body {teamName, members, leadUid}  `id: post_projects_projectid_teams`
- `GET /api/projects/:projectId/teams/mine`  `id: get_projects_projectid_teams_mine`
- `POST /api/submissions/:submissionId/feedback`  body {feedback, role}  `id: post_submissions_submissionid_feedback`
- `POST /api/teams/:teamId/leave`  `id: post_teams_teamid_leave`
- `PATCH /api/teams/:teamId/status`  body {status, approvedBy}  `id: patch_teams_teamid_status`
- `GET /api/upload/material`  `id: get_upload_material_3`

## proposals

- **[C]** `GET /api/cn/courses/:courseId/project-requirements` — Project requirements/rubric for the course.  `id: proposals.requirements`
- **[C]** `POST /api/cn/groups/:groupId/proposals` — Create a project proposal for a group.  `id: proposals.create`
- **[C]** `PATCH /api/cn/proposals/:proposalId` — Update a proposal draft.  `id: proposals.update`
- **[C]** `GET /api/cn/proposals/:proposalId/feedback` — Feedback on a proposal.  `id: proposals.feedback`
- **[C]** `POST /api/cn/proposals/:proposalId/files` — Attach a file to a proposal (multipart).  `id: proposals.fileUpload`
- **[C]** `POST /api/cn/proposals/:proposalId/submit` — Submit a proposal for review.  `id: proposals.submit`

## records

- **[C]** `GET /api/cn/records` — My evidence records.  `id: records.list`
- **[C]** `POST /api/cn/records` — Create a record. Body: { title, description?, date, course_id?, space_id?, context_type?, location?, link_url?, keep_private? }.  body {title, description, date, space, space_id, course_id, context_type, location, link_url, keep_private}  `id: records.create`
- **[C]** `DELETE /api/cn/records/:recordId` — Delete a record.  `id: records.delete`
- **[C]** `GET /api/cn/records/:recordId` — Get a record with matched sub-capabilities.  `id: records.get`
- **[C]** `POST /api/cn/records/:recordId/proof` — Attach proof: multipart 'file', or form field 'link_url'.  `id: records.proofUpload`
- **[C]** `DELETE /api/cn/records/:recordId/proof` — Remove an attached proof by index.  `id: records.proofDelete`
- **[C]** `POST /api/cn/records/:recordId/verify` — Verify a record (peer/staff).  body {verdict, comment}  `id: records.verify`
- **[C]** `POST /api/cn/records/analyze-photo` — AI-suggest title/description/date/location from a photo (multipart 'file').  `id: records.analyzePhoto`
- `GET /api/v1/records/analyse-proof`  `id: get_records_analyse_proof`

## reports

- `GET /api/analytics/cohort`  `id: get_analytics_cohort`
- `POST /api/analytics/course-alignment`  `id: post_analytics_course_alignment`
- `POST /api/cn/courses/:courseId/alignment`  `id: post_courses_courseid_alignment`
- `GET /api/cn/courses/:courseId/alignment`  `id: get_courses_courseid_alignment`
- `GET /api/reports`  `id: get_reports`
- `GET /api/reports/cohort/history`  `id: get_reports_cohort_history`
- `GET /api/reports/cohort/latest`  `id: get_reports_cohort_latest`

## rubrics

- `GET /api/rubrics/parse`  `id: get_rubrics_parse`

## session

- `GET /api/cn/auth/signup`  `id: get_auth_signup`

## spaces

- **[C]** `POST /api/cn/student/:studentUid/courses/:courseId/ensure-space` — Ensure a course-linked space exists.  `id: space.ensureForCourse`
- **[C]** `GET /api/cn/student/:studentUid/spaces` — My personal spaces.  `id: spaces.list`
- **[C]** `POST /api/cn/student/:studentUid/spaces` — Create a personal space. Body: { name, space_type } (space_type defaults to 'hobby').  body {name, space_type}  `id: space.create`
- **[C]** `DELETE /api/cn/student/:studentUid/spaces/:spaceId` — Delete a personal space.  `id: space.delete`
- **[C]** `GET /api/cn/student/:studentUid/spaces/:spaceId/records` — Records inside a space.  `id: space.records`

## ta-Coo_YQ

- `GET /api/ta-invites`  `id: get_ta_invites`
- `POST /api/ta-invites/:taInviteId/revoke`  `id: post_ta_invites_tainviteid_revoke`
- `GET /api/ta-invites/by-token/:byTokenId`  `id: get_ta_invites_by_token_bytokenid`
- `GET /api/ta-invites/claim`  `id: get_ta_invites_claim`

## tier

- `POST /api/auth/student-signup-and-join`  `id: post_auth_student_signup_and_join`
- `GET /api/cn/courses/code/:codeId/preview`  `id: get_courses_code_codeid_preview`
- `GET /api/cn/courses/join`  `id: get_courses_join`
- `GET /api/courses/join`  `id: get_courses_join_2`
- `GET /api/invites/:inviteId`  `id: get_invites_inviteid`

## weekly-log

- **[C]** `GET /api/cn/courses/:courseId/groups/:groupId/weekly-logs` — All weekly logs for a group. Returns { logs }.  `id: weeklyLog.list`
- **[C]** `GET /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week` — A single week's log entry.  `id: weeklyLog.get`
- **[C]** `PUT /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week` — Set the whole group's weekly log. Body: { summaryOfWork, challenges, helpRequested, supportOutcome, ... }.  body {teamName, sessionGroupTable, members, kanbanStatus, proofUploaded, summaryOfWork, challenges, helpRequested, supportOutcome}  `id: weeklyLog.setGroup`
- **[C]** `PUT /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/my-entry` — Submit/update MY entry for a week. Body: { reflection, signed }.  body {reflection, signed}  `id: weeklyLog.myEntry`
- **[C]** `POST /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/screenshot` — Attach a screenshot to a weekly log (multipart 'file').  `id: weeklyLog.screenshotUpload`
- **[C]** `DELETE /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/screenshot` — Delete a weekly-log screenshot by storage key.  `id: weeklyLog.screenshotDelete`

## weeklyLog

- `GET /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:weeklyLogId`  `id: get_courses_courseid_groups_groupid_weekly_logs_weeklylogid`
- `PUT /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:weeklyLogId`  `id: put_courses_courseid_groups_groupid_weekly_logs_weeklylogid`
- `PUT /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:weeklyLogId/my-entry`  `id: put_courses_courseid_groups_groupid_weekly_logs_weeklylogid_my_entry`
- `DELETE /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:weeklyLogId/screenshot`  `id: delete_courses_courseid_groups_groupid_weekly_logs_weeklylogid_screenshot`
- `POST /api/cn/courses/:courseId/groups/:groupId/weekly-logs/:weeklyLogId/screenshot`  `id: post_courses_courseid_groups_groupid_weekly_logs_weeklylogid_screenshot`

