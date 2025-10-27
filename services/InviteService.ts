export interface InviteValidation {
  isValid: boolean;
  listId?: string;
  listName?: string;
}

export class InviteService {
  static generateToken(listId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${listId}-${timestamp}-${random}`;
  }

  static generateInviteLink(listId: string, token: string): string {
    return `app://join?list=${listId}&token=${token}`;
  }

  static parseInviteUrl(url: string): { listId: string; token: string } | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'app:' || urlObj.pathname !== '//join') {
        return null;
      }
      const listId = urlObj.searchParams.get('list');
      const token = urlObj.searchParams.get('token');
      
      if (!listId || !token) {
        return null;
      }
      
      return { listId, token };
    } catch {
      return null;
    }
  }

  static async validate(token: string, listId: string): Promise<InviteValidation> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isValid: true,
          listId,
          listName: 'Mock List',
        });
      }, 500);
    });
  }
}
