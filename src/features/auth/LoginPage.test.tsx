import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('submits the single-user login credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<LoginPage onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('로그인 아이디'), 'owner');
    await user.type(screen.getByLabelText('비밀번호'), 'correct-password');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(onSubmit).toHaveBeenCalledWith({
      loginId: 'owner',
      password: 'correct-password',
    });
  });

  it('requires both credentials before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginPage onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(screen.getByRole('alert')).toHaveTextContent('로그인 아이디를 입력하세요.');
    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호를 입력하세요.');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
