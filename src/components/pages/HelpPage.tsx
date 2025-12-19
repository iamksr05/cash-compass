import { useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  BookOpen,
  Lightbulb,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const faqs = [
  {
    question: 'What is runway and why is it important?',
    answer:
      'Runway is the number of months your business can continue to operate with its current cash balance, assuming your expenses stay the same. It\'s crucial for planning because it tells you how much time you have before you need more funding or revenue.',
  },
  {
    question: 'How is burn rate calculated?',
    answer:
      'Burn rate is calculated by taking your total expenses and subtracting your total income. If your expenses exceed income, you have a positive burn rate (you\'re "burning" cash). We calculate this monthly to give you a clear picture of your spending.',
  },
  {
    question: 'What\'s the difference between fixed and variable expenses?',
    answer:
      'Fixed expenses are costs that remain the same each month (like rent, salaries, and subscriptions). Variable expenses change based on your business activity (like marketing spend, supplies, or contractor payments).',
  },
  {
    question: 'How accurate is the forecast?',
    answer:
      'The forecast is based on your current income and expense patterns. It assumes these will continue at the same rate. For more accurate forecasts, keep your transaction data up to date and mark recurring transactions appropriately.',
  },
  {
    question: 'Can I track multiple businesses?',
    answer:
      'Currently, CashFlow supports one business per account. Multi-business support is on our roadmap for a future update.',
  },
  {
    question: 'How do I export my data?',
    answer:
      'You can export your data from the Reports section. We support CSV and text report formats. Go to Reports, select your date range, and click the export button.',
  },
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of tracking your cash flow',
    icon: BookOpen,
    content: 'Welcome to CashFlow! Start by adding your first transaction using the "Add Transaction" button. Track all money coming in as Income and money going out as Expenses. Check your Dashboard regularly to monitor your runway and get insights about your spending patterns.',
  },
  {
    title: 'Best Practices',
    description: 'Tips for effective cash management',
    icon: Lightbulb,
    content: '1. Log transactions as they happen - don\'t wait!\n2. Use categories consistently to get accurate insights\n3. Mark recurring expenses to improve forecast accuracy\n4. Check your runway weekly\n5. Review insights and act on warnings\n6. Export monthly reports for your records',
  },
  {
    title: 'Data Security',
    description: 'How we keep your financial data safe',
    icon: Shield,
    content: 'Your data is protected with industry-standard encryption. We use secure authentication, all data is stored in encrypted databases, and we never share your financial information with third parties. Regular security audits ensure your data stays safe.',
  },
];

export function HelpPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState<typeof resources[0] | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [emailData, setEmailData] = useState({ subject: '', message: '' });

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSubmit = () => {
    if (!chatMessage.trim()) return;
    toast({
      title: 'Message sent!',
      description: 'Our support team will respond within 24 hours.',
    });
    setChatMessage('');
    setChatOpen(false);
  };

  const handleEmailSubmit = () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }
    toast({
      title: 'Email sent!',
      description: 'We\'ll get back to you as soon as possible.',
    });
    setEmailData({ subject: '', message: '' });
    setEmailOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-elevated p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          How can we help you?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find answers to common questions or get in touch with our team
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      {/* Quick Resources */}
      <div className="grid gap-4 md:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <button
              key={resource.title}
              onClick={() => setResourceOpen(resource)}
              className="card-elevated flex items-start gap-4 p-6 text-left transition-all hover:shadow-lg"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {resource.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="card-elevated p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Frequently Asked Questions
        </h2>
        {filteredFaqs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No results found for "{searchQuery}"
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Contact */}
      <div className="card-elevated p-6">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Still need help?
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Live Chat</p>
              <p className="text-sm text-muted-foreground">
                Chat with our support team
              </p>
            </div>
          </button>
          <button
            onClick={() => setEmailOpen(true)}
            className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Email Support</p>
              <p className="text-sm text-muted-foreground">
                support@cashflow.app
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Resource Dialog */}
      <Dialog open={!!resourceOpen} onOpenChange={() => setResourceOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resourceOpen?.title}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 whitespace-pre-wrap text-muted-foreground">
            {resourceOpen?.content}
          </div>
        </DialogContent>
      </Dialog>

      {/* Live Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Live Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Send us a message and we'll respond within 24 hours.
            </p>
            <div className="space-y-2">
              <Label htmlFor="chatMessage">Your Message</Label>
              <Textarea
                id="chatMessage"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                rows={4}
              />
            </div>
            <Button onClick={handleChatSubmit} className="w-full">
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="What do you need help with?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Message</Label>
              <Textarea
                id="emailMessage"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>
            <Button onClick={handleEmailSubmit} className="w-full">
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
