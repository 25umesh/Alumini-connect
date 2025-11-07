export const onboardingTemplate = (name: string, link: string, college: string) => ({
  subject: `${college}: Activate your alumni profile`,
  text: `Hi ${name},\n\nPlease confirm your alumni profile: ${link}\n\nIf you don't want these emails unsubscribe here: [link]`
});
